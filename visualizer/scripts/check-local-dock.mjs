import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const base = process.env.VISUALIZER_URL || 'http://127.0.0.1:5180';
const profile = await mkdtemp(join(tmpdir(), 'visualizer-browser-'));
const chrome = spawn(process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=9341', `--user-data-dir=${profile}`, 'about:blank',
], { windowsHide: true, stdio: 'ignore' });
let socket;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function waitFor(fn) {
  for (let count = 0; count < 120; count++) { const result = await fn().catch(() => false); if (result) return result; await delay(250); }
  throw new Error('Browser check timed out');
}
try {
  const tabs = await waitFor(async () => { const response = await fetch('http://127.0.0.1:9341/json'); return response.json(); });
  socket = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
  await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
  let sequence = 0;
  const pending = new Map(), errors = [];
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text + ': ' + message.params.exceptionDetails.exception?.description);
    if (message.id) { const promise = pending.get(message.id); pending.delete(message.id); message.error ? promise.reject(message.error) : promise.resolve(message.result); }
  });
  const command = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  };
  await command('Runtime.enable');
  await command('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  const click = expression => evaluate(`(${expression}).click()`);
  await command('Page.navigate', { url: `${base}/#sort-colors` });
  await waitFor(() => evaluate(`Boolean(document.querySelector('.local-dock-layout [data-panel-id="input"]'))`)).catch(async error => { console.log(errors); console.log(await evaluate(`document.body.innerText.slice(0,3000)`)); throw error; });
  await delay(300);
  await waitFor(() => evaluate(`Boolean(document.querySelector('[data-panel-id="input"] input'))`));
  await evaluate(`(()=>{const input=document.querySelector('[data-panel-id="input"] input');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'[2,0,1]');input.dispatchEvent(new Event('input',{bubbles:true}));})()`);
  await delay(100);
  const before = await evaluate(`(()=>{window.dockInput=document.querySelector('[data-panel-id="input"] input'); window.codeHost=document.querySelector('[data-panel-id="code"]'); return document.querySelector('[data-panel-id="viz"]').getBoundingClientRect().width})()`);
  await click(`document.querySelector('button[aria-label="Collapse Code"]')`);
  await delay(100);
  assert.equal(await evaluate(`document.querySelector('.local-dock-layout [data-dock-tab="code"]') === null`), true);
  assert.ok(await evaluate(`document.querySelector('[data-panel-id="viz"]').getBoundingClientRect().width`) > before + 100);
  await click(`[...document.querySelectorAll('.local-dock-restore button')].find(b=>b.textContent==='Restore Code')`);
  await delay(100);
  assert.equal(await evaluate(`window.codeHost === document.querySelector('[data-panel-id="code"]') && window.dockInput === document.querySelector('[data-panel-id="input"] input')`), true);
  assert.ok(Math.abs(await evaluate(`document.querySelector('[data-panel-id="viz"]').getBoundingClientRect().width`) - before) < 3);
  assert.equal(await evaluate(`window.dockInput.value`), '[2,0,1]');
  console.log('PASS collapse frees layout space; restore preserves hosts, input values, and proportions');
  const originalHeight = await evaluate(`document.querySelector('[data-panel-id="viz"]').getBoundingClientRect().height`);
  await click(`document.querySelector('button[aria-label="Collapse Input"]')`);
  await delay(100);
  assert.ok(await evaluate(`document.querySelector('[data-panel-id="viz"]').getBoundingClientRect().height`) > originalHeight + 30);
  await click(`[...document.querySelectorAll('.local-dock-restore button')].find(b=>b.textContent==='Restore Input')`);
  await delay(100);
  console.log('PASS nested vertical collapse reallocates height');


  await evaluate(`(()=>{const select=document.querySelector('select[aria-label="Move Code"]');select.value=JSON.stringify(['tab','viz']);select.dispatchEvent(new Event('change',{bubbles:true}));})()`);
  await delay(100);
  assert.equal(await evaluate(`document.querySelector('[data-dock-tab="code"]').closest('.local-dock-group').querySelectorAll('[role="tab"]').length`), 2);
  await click(`document.querySelector('button[aria-label="Collapse Code"]')`);
  await delay(80);
  assert.equal(await evaluate(`document.querySelector('[data-dock-tab="viz"]').getAttribute('aria-selected')`), 'true');
  await click(`[...document.querySelectorAll('.local-dock-restore button')].find(b=>b.textContent==='Restore Code')`);
  await delay(80);
  await evaluate(`(()=>{const select=document.querySelector('select[aria-label="Move Code"]');select.value=JSON.stringify(['right','viz']);select.dispatchEvent(new Event('change',{bubbles:true}));})()`);
  await delay(100);
  assert.equal(await evaluate(`document.querySelector('[data-dock-tab="code"]').closest('.local-dock-group').querySelectorAll('[role="tab"]').length`), 1);
  const ratio = await evaluate(`document.querySelector('.local-dock-divider').getAttribute('aria-valuenow')`);
  await evaluate(`document.querySelector('.local-dock-divider').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}))`);
  await delay(80);
  assert.notEqual(await evaluate(`document.querySelector('.local-dock-divider').getAttribute('aria-valuenow')`), ratio);
  console.log('PASS grouping, splitting, and keyboard resize');
  const divider = await evaluate(`(()=>{const node=document.querySelector('.local-dock-divider');const r=node.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,orientation:node.getAttribute('aria-orientation'),value:node.getAttribute('aria-valuenow')}})()`);
  await command('Input.dispatchMouseEvent',{type:'mouseMoved',x:divider.x,y:divider.y});
  await command('Input.dispatchMouseEvent',{type:'mousePressed',x:divider.x,y:divider.y,button:'left',buttons:1,clickCount:1});
  await command('Input.dispatchMouseEvent',{type:'mouseMoved',x:divider.x+(divider.orientation==='vertical'?40:0),y:divider.y+(divider.orientation==='horizontal'?40:0),button:'left',buttons:1});
  await command('Input.dispatchMouseEvent',{type:'mouseReleased',x:divider.x+(divider.orientation==='vertical'?40:0),y:divider.y+(divider.orientation==='horizontal'?40:0),button:'left',clickCount:1});
  await delay(100);
  assert.notEqual(await evaluate(`document.querySelector('.local-dock-divider').getAttribute('aria-valuenow')`),divider.value);
  console.log('PASS pointer divider resizing');


  await evaluate(`(()=>{window.tabDrag=new DataTransfer();document.querySelector('[data-dock-tab="code"]').dispatchEvent(new DragEvent('dragstart',{bubbles:true,dataTransfer:window.tabDrag}));})()`);
  await delay(80);
  await evaluate(`document.querySelector('[data-dock-tab="viz"]').closest('.local-dock-group').querySelector('.local-dock-zone.bottom').dispatchEvent(new DragEvent('drop',{bubbles:true,dataTransfer:window.tabDrag}))`);
  await delay(80);
  assert.equal(await evaluate(`document.querySelectorAll('.local-dock-zones').length`), 0);
  assert.equal(await evaluate(`window.codeHost === document.querySelector('[data-panel-id="code"]')`), true);
  console.log('PASS drag/drop preserves portal host');

  await click(`document.querySelector('button[title="Dock panel below workspace"]')`);
  await waitFor(() => evaluate(`Boolean(document.querySelector('.local-dock-layout .floating-panel.is-docked'))`));
  await click(`document.querySelector('.local-dock-layout .floating-panel-collapse')`);
  await waitFor(() => evaluate(`Boolean([...document.querySelectorAll('.local-dock-restore button')].find(b=>b.textContent.includes('Playback')))`));
  await click(`[...document.querySelectorAll('.local-dock-restore button')].find(b=>b.textContent.includes('Playback'))`);
  await waitFor(() => evaluate(`Boolean(document.querySelector('.local-dock-layout .floating-panel-body'))`));
  await click(`document.querySelector('button[title="Float panel over workspace"]')`);
  await waitFor(() => evaluate(`Boolean(document.querySelector('.floating-panel:not(.is-docked)'))`));
  assert.equal(await evaluate(`Boolean(document.querySelector('.local-dock-layout .floating-panel'))`), false);
  console.log('PASS dock, collapse, restore, and float playback');

  await evaluate(`(()=>{document.querySelectorAll('.local-dock-header > button').forEach(button=>button.click())})()`);
  await delay(100);
  assert.equal(await evaluate(`Boolean(document.querySelector('.local-dock-empty'))`), true);
  await evaluate(`document.querySelectorAll('.local-dock-restore button').forEach(button=>button.click())`);
  await delay(100);
  assert.equal(await evaluate(`window.dockInput === document.querySelector('[data-panel-id="input"] input')`), true);
  await mkdir('.tmp', { recursive: true });
  const screenshot = await command('Page.captureScreenshot', { format: 'png' });
  await writeFile('.tmp/local-dock.png', Buffer.from(screenshot.data, 'base64'));
  assert.deepEqual(errors, []);
  console.log('PASS collapse all / restore all; no browser exceptions');
} finally { socket?.close(); chrome.kill(); }
