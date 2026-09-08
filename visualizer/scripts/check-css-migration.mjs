import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

// Run before committing a CSS migration, or pass its pre-migration revision.
const baseline = process.argv[2] || 'HEAD';
const postcss = createRequire(import.meta.resolve('vite'))('postcss');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const git = args => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
// Browsers strip the encoding marker when loading a stylesheet as a resource.
const normalize = text => text.replace(/^\uFEFF/, '').replaceAll('\r\n', '\n');
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'visualizer-css-check-'));
const chrome = spawn(process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank',
], { windowsHide: true, stdio: 'ignore' });
let launchError;
chrome.on('error', error => { launchError = error; });
let ws;
try {
  let port;
  for (let i = 0; i < 100; i++) {
    if (launchError) throw launchError;
    try { port = fs.readFileSync(path.join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0]; break; }
    catch { await delay(100); }
  }
  if (!port) throw new Error('Chrome did not start; set CHROME_PATH to its executable.');
  const tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  ws = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
  await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    message.error ? request.reject(new Error(message.error.message)) : request.resolve(message.result);
  });
  const call = (method, params = {}) => new Promise((resolve, reject) => {
    const next = ++id; pending.set(next, { resolve, reject });
    ws.send(JSON.stringify({ id: next, method, params }));
  });
  for (const domain of ['Page', 'DOM', 'CSS']) await call(`${domain}.enable`);
  const base = normalize(fs.readFileSync('src/index.css', 'utf8'));
  const shared = normalize(fs.readFileSync('src/components/shared/VisualizerChrome.css', 'utf8'));
  const files = git(['diff', '--name-only', baseline]).trim().split('\n')
    .filter(file => file.startsWith('visualizer/src/problems/') && file.endsWith('.css'));
  if (!files.length) throw new Error('No changed problem CSS files to compare.');
  let comparisons = 0, bytesRemoved = 0;
  for (const gitPath of files) {
    const file = gitPath.replace(/^visualizer\//, '');
    const before = normalize(git(['show', `${baseline}:${gitPath}`]));
    const after = normalize(fs.readFileSync(file, 'utf8'));
    const jsx = fs.readFileSync(file.replace(/\.css$/, '.jsx'), 'utf8');
    bytesRemoved += Buffer.byteLength(before) - Buffer.byteLength(after);
    const mappings = new Map();
    for (const match of jsx.matchAll(/className="([^"]+)"/g)) {
      const tokens = match[1].split(/\s+/);
      for (let i = 0; i < tokens.length - 1; i++) if (tokens[i].startsWith('vis-')) mappings.set(tokens[i], tokens[i + 1]);
    }
    let oldShell;
    postcss.parse(before).walkRules(rule => {
      if (/^\.[\w-]+-shell$/.test(rule.selector) && !oldShell) oldShell = rule.selector.slice(1);
    });
    for (const theme of ['light', 'dark']) for (const width of [180, 360, 600, 900]) for (const hover of [false, true]) {
      await call('Emulation.setDeviceMetricsOverride', { width, height: 700, deviceScaleFactor: 1, mobile: false });
      const snapshots = [];
      for (const migrated of [false, true]) {
        const cls = common => {
          const local = mappings.get(common) || (common === 'vis-shell' ? oldShell : '') || '';
          return migrated && mappings.has(common) ? `${common} ${local}` : local;
        };
        const html = `<html data-theme="${theme}"><head><style>${base}\n${shared}\n${migrated ? after : before}</style></head><body><div class="${cls('vis-shell')}"><section class="${cls('vis-panel')}"><header class="${cls('vis-panel-head')}">Panel</header><div class="${cls('vis-panel-body')}"><button class="${cls('vis-example-btn')}">Example</button><div style="height:900px">Content</div></div></section></div></body></html>`;
        const frameId = (await call('Page.getFrameTree')).frameTree.frame.id;
        await call('Page.setDocumentContent', { frameId, html });
        if (hover) {
          const doc = await call('DOM.getDocument');
          const button = await call('DOM.querySelector', { nodeId: doc.root.nodeId, selector: 'button' });
          await call('CSS.forcePseudoState', { nodeId: button.nodeId, forcedPseudoClasses: ['hover'] });
          await delay(250);
        }
        const result = await call('Runtime.evaluate', {
          expression: `JSON.stringify([...document.querySelectorAll('body > div,section,header,section > div,button')].map(el=>{const s=getComputedStyle(el);return Object.fromEntries([...s].filter(p=>!p.startsWith('--')).map(p=>[p,s.getPropertyValue(p)]));}))`,
          returnByValue: true,
        });
        snapshots.push(result.result.value);
      }
      if (snapshots[0] !== snapshots[1]) throw new Error(`Computed styles differ: ${file}, ${theme}, ${width}px, hover=${hover}`);
      comparisons++;
    }
    console.log(`Matched: ${file}`);
  }
  console.log(JSON.stringify({ visualizers: files.length, comparisons, bytesRemoved, result: 'identical' }));
} finally {
  ws?.close();
  chrome.kill();
}
