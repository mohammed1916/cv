import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9333;
export async function launch(profile) {
  mkdirSync(profile, { recursive: true });
  const proc = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run', '--disable-gpu', '--window-size=1280,900', 'about:blank'], { stdio: 'ignore' });
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); if (r.ok) break; } catch {}
    await new Promise(r => setTimeout(r, 250));
  }
  const targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
  const page = targets.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map();
  ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
  const send = (method, params = {}) => new Promise(res => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
  await send('Runtime.enable'); await send('Page.enable');
  const evaluate = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.result?.exceptionDetails) return { error: r.result.exceptionDetails.text };
    return r.result?.result?.value;
  };
  const navigate = async (url) => { await send('Page.navigate', { url }); };
  const close = () => { ws.close(); proc.kill(); };
  return { evaluate, navigate, close, send };
}
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export async function waitFor(evaluate, expr, timeout = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeout) { const v = await evaluate(expr); if (v) return v; await sleep(200); }
  return null;
}
