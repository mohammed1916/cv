import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const base = process.env.VISUALIZER_URL || 'http://127.0.0.1:5178';
const profile = await mkdtemp(join(tmpdir(), 'visualizer-browser-'));
const chrome = spawn(process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=9337', `--user-data-dir=${profile}`, 'about:blank',
], { windowsHide: true, stdio: 'ignore' });
let socket;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function waitFor(fn) {
  for (let count = 0; count < 120; count++) { const result = await fn().catch(() => false); if (result) return result; await delay(250); }
  throw new Error('Browser check timed out');
}
try {
  const tabs = await waitFor(async () => { const response = await fetch('http://127.0.0.1:9337/json'); return response.json(); });
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
  for (const slug of ['integer-to-roman', 'roman-to-integer', 'palindrome-number', 'string-to-integer-atoi', 'n-queens', 'longest-palindromic-substring', 'regular-expression-matching', 'median-of-two-sorted-arrays']) {
    await command('Page.navigate', { url: 'about:blank' });
    await waitFor(() => evaluate(`location.href === 'about:blank'`));
    await command('Page.navigate', { url: `${base}/#${slug}` });
    await waitFor(() => evaluate(`Boolean(document.querySelector('.ctp-panel'))`));
    assert.equal(await evaluate(`document.body.innerText.includes('Editor:')`), false);
    assert.equal(await evaluate(`document.body.innerText.includes('Edit in Code Playground')`), true);
    if (slug === 'palindrome-number') assert.equal(await evaluate(`Boolean(document.querySelector('.pn-viz-container .mip-input'))`), true);
    if (slug.includes('roman')) {
      assert.equal(await evaluate(`Boolean(document.querySelector('.lookup-map'))`), true);
      await evaluate(`(()=>{const input=document.querySelector('.mip-input'); const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set; setter.call(input, ${JSON.stringify(slug === 'integer-to-roman' ? '1994' : 'IV')}); input.dispatchEvent(new Event('input',{bubbles:true}));})()`);
      await delay(200);
      for (let step = 0; step < 12; step++) {
        await evaluate(`(()=>{const button=[...document.querySelectorAll('button')].find(b=>b.textContent.trim() === 'Next'); if(!button) throw Error('Next button missing'); button.click()})()`);
        await delay(35);
      }
      assert.equal(await evaluate(`document.querySelectorAll('.accumulation-term').length > 0`), true, await evaluate(`document.querySelector('.lookup-flow')?.innerText`));
      await mkdir('.tmp', { recursive: true });
      const screenshot = await command('Page.captureScreenshot', { format: 'png' });
      await writeFile(`.tmp/${slug}.png`, Buffer.from(screenshot.data, 'base64'));
    }
    console.log(`PASS ${slug}`);
  }
  await command('Page.navigate', { url: `${base}/#roman-to-integer` });
  await waitFor(() => evaluate(`Boolean(document.querySelector('.lookup-map'))`));
  await evaluate(`localStorage.setItem('cpviz.runtime-playground.python-source.v1','preserve this draft'); [...document.querySelectorAll('button')].find(b=>b.textContent==='Edit in Code Playground').click()`);
  await waitFor(() => evaluate(`Boolean(document.querySelector('dialog[open]'))`));
  await evaluate(`document.querySelector('dialog .access-primary').click()`);
  await waitFor(() => evaluate(`location.hash === '#playground' && new URLSearchParams(location.search).has('workspace')`));
  const saved = await evaluate(`(()=>{const id=new URLSearchParams(location.search).get('workspace');return {metadata:JSON.parse(localStorage.getItem('cpviz.problem-workspace.'+id+'.metadata')), input:JSON.parse(localStorage.getItem('cpviz.problem-workspace.'+id+'.input')),original:localStorage.getItem('cpviz.runtime-playground.python-source.v1')}})()`);
  assert.equal(saved.metadata.entry, 'romanToInt');
  assert.equal(saved.metadata.slug, 'roman-to-integer');
  assert.deepEqual(saved.input, { s: 'MCMXCIV' });
  assert.equal(saved.original, 'preserve this draft');
  assert.deepEqual(errors, []);
  console.log('PASS playground import and draft preservation; no browser exceptions');
} finally { socket?.close(); chrome.kill(); }
