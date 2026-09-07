import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'
import assert from 'node:assert/strict'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'recent-visualizers-'))
const chrome = spawn(process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--no-first-run', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank',
], { windowsHide: true, stdio: 'ignore' })
let ws
try {
  let port
  for (let i = 0; i < 100; i++) {
    try { port = fs.readFileSync(path.join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0]; break } catch { await delay(100) }
  }
  assert.ok(port, 'Chrome must start (override executable with CHROME_PATH)')
  const tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json()
  ws = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl)
  await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }))
  let id = 0
  const pending = new Map(), errors = []
  ws.addEventListener('message', event => {
    const message = JSON.parse(event.data)
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text)
    const request = pending.get(message.id)
    if (!request) return
    pending.delete(message.id)
    message.error ? request.reject(new Error(message.error.message)) : request.resolve(message.result)
  })
  const call = (method, params = {}) => new Promise((resolve, reject) => {
    const next = ++id
    pending.set(next, { resolve, reject })
    ws.send(JSON.stringify({ id: next, method, params }))
  })
  const evaluate = async expression => {
    const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
    return result.result.value
  }
  const until = async expression => {
    for (let i = 0; i < 100; i++) { if (await evaluate(expression)) return; await delay(100) }
    throw new Error(`Timed out: ${expression}`)
  }
  const setValue = async (selector, value, prototype = 'HTMLInputElement') => {
    await evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});Object.getOwnPropertyDescriptor(${prototype}.prototype,'value').set.call(el,${JSON.stringify(value)});el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));})()`)
    await delay(150)
  }
  await call('Runtime.enable')
  await call('Page.enable')
  for (const [number, expected] of [['3913', 'leetcedo'], ['3914', '2']]) {
    await call('Page.navigate', { url: process.env.VISUALIZER_URL || 'http://127.0.0.1:3010' })
    await until(`!!document.querySelector('.search-input')`)
    await setValue('.search-input', number)
    await until(`document.querySelector('.problem-card')?.textContent.includes('${number}')`)
    await evaluate(`document.querySelector('.problem-card').click()`)
    await until(`document.querySelectorAll('.algorithm-workspace__panel').length === 3`)
    await evaluate(`document.querySelector('[aria-label="Algorithm timeline"]').focus()`)
    await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'End', code: 'End', windowsVirtualKeyCode: 35 })
    await call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'End', code: 'End', windowsVirtualKeyCode: 35 })
    await until(`document.querySelector('.algorithm-workspace output')?.textContent.includes('${expected}')`)
    for (const width of [390, 1280]) {
      await call('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false })
      await delay(200)
      assert.ok(await evaluate(`Array.from(document.querySelectorAll('.algorithm-workspace__panel')).every(el=>el.clientHeight>0 && el.clientWidth>0)`), 'Panels remain visible')
    }
    const input = number === '3913' ? JSON.stringify('ae'.repeat(40)) : JSON.stringify(Array.from({length:80}, (_,i)=>80-i))
    await setValue('.algorithm-workspace textarea', input, 'HTMLTextAreaElement')
    await evaluate(`document.querySelector('.algorithm-workspace button[type="submit"]').click()`)
    await until(`!!document.querySelector('.algorithm-sequence nav')`)
    await evaluate(`Array.from(document.querySelectorAll('.algorithm-sequence button')).find(el=>el.textContent==='Next page').click()`)
    await until(`document.querySelector('.algorithm-sequence small')?.textContent==='[32]'`)
    await setValue('.algorithm-workspace textarea', 'invalid', 'HTMLTextAreaElement')
    await evaluate(`document.querySelector('.algorithm-workspace button[type="submit"]').click()`)
    await until(`!!document.querySelector('.algorithm-workspace [role="alert"]')`)
    assert.equal(await evaluate(`document.querySelectorAll('.algorithm-sequence').length`), 0, 'Invalid input must not show stale results')
    await evaluate(`document.querySelector('.algorithm-workspace__examples button').click()`)
    await until(`!!document.querySelector('.algorithm-sequence') && !document.querySelector('.algorithm-workspace [role="alert"]')`)
    console.log(`${number}: catalog, panels, final frame, resize, paging, validation and recovery passed`)
  }
  assert.deepEqual(errors, [], 'No browser runtime exceptions')
} finally {
  ws?.close()
  chrome.kill()
}
