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
  const cases = [
    ['3913', 'leetcedo'], ['3914', '2'], ['3912', '[1,2,4,3,2]'],
    ['3915', 'Maximum sum: 7'], ['3905', '[[1,1,2],[1,2,2],[2,2,2]]'],
    ['3903', 'Smallest stable index: 3'], ['3904', 'Smallest stable index: 3'],
    ['3909', 'Result: 1'], ['3910', 'Final count: 2'], ['3908', 'Valid: true'],
    ['3899', '[36.869897'], ['3894', 'Signal: Red'], ['3895', 'Total occurrences: 4'],
    ['3896', 'Minimum operations: 3'],
  ]
  for (const [number, expected] of cases) {
    await call('Page.navigate', { url: process.env.VISUALIZER_URL || 'http://127.0.0.1:3010' })
    await until(`!!document.querySelector('.search-input')`)
    await setValue('.search-input', number)
    await until(`document.querySelector('.problem-card')?.textContent.includes('${number}')`)
    await evaluate(`document.querySelector('.problem-card').click()`)
    await until(`document.querySelectorAll('.algorithm-workspace__panel').length === 3`)
    await until(`!!document.querySelector('.floating-panel .algorithm-workspace__playback')`)
    await evaluate(`document.querySelector('.floating-panel [aria-label="Collapse panel"]').click()`)
    await until(`!document.querySelector('.floating-panel .algorithm-workspace__playback')`)
    await evaluate(`document.querySelector('.floating-panel [aria-label="Expand panel"]').click()`)
    await until(`!!document.querySelector('.floating-panel .algorithm-workspace__playback')`)
    await evaluate(`document.querySelector('.algorithm-workspace__phases button:nth-child(2)').click()`)
    await until(`document.querySelector('.algorithm-workspace__phases button:nth-child(2)').getAttribute('aria-current')==='step'`)
    assert.ok(await evaluate(`document.querySelector('.algorithm-workspace__current-state').textContent.includes('Code line')`))
    await evaluate(`Array.from(document.querySelectorAll('.algorithm-workspace__playback button')).find(el=>el.textContent==='Dock controls').click()`)
    await until(`!document.querySelector('.floating-panel') && !!document.querySelector('.algorithm-workspace .algorithm-workspace__playback')`)
    await evaluate(`Array.from(document.querySelectorAll('.algorithm-workspace__playback button')).find(el=>el.textContent==='Float controls').click()`)
    await until(`!!document.querySelector('.floating-panel .algorithm-workspace__playback')`)
    await evaluate(`document.querySelector('[aria-label="Algorithm timeline"]').focus()`)
    await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'End', code: 'End', windowsVirtualKeyCode: 35 })
    await call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'End', code: 'End', windowsVirtualKeyCode: 35 })
    await until(`document.querySelector('.algorithm-workspace output')?.textContent.includes('${expected}')`)
    await until(`document.querySelector('[data-phase="done"]').getAttribute('aria-current')==='step'`)
    if (number === '3910') {
      await setValue('[aria-label="Algorithm timeline"]', '12')
      await until(`document.querySelector('.algorithm-workspace__current-state').textContent.includes('unreachable')`)
      assert.equal(await evaluate(`document.querySelectorAll('[data-edge][data-role="retained"]').length`), 0)
      assert.equal(await evaluate(`document.querySelector('[data-node="1"]').getAttribute('data-role')`), 'excluded')
      assert.equal(await evaluate(`document.querySelector('[data-node="2"]').getAttribute('data-role')`), 'selected')
    }
    if (number === '3915') {
      assert.equal(await evaluate(`document.querySelectorAll('.algorithm-path circle').length`), 2)
      assert.ok(await evaluate(`document.querySelector('.algorithm-path').textContent.includes('gap 2')`))
    }
    if (number === '3905') {
      await evaluate(`document.querySelector('.algorithm-grid [data-row="1"][data-column="1"]').click()`)
      await until(`document.querySelector('.algorithm-grid__detail').textContent.includes('Color 2, reached at time 2')`)
      await evaluate(`document.querySelector('[data-phase="start"]').click()`)
      await until(`document.querySelector('.algorithm-grid__detail').textContent.includes('Uncolored')`)
      await evaluate(`document.querySelector('[data-phase="propose"]').click()`)
      for (const frame of [2, 3]) {
        await evaluate(`Array.from(document.querySelectorAll('.algorithm-workspace__playback button')).find(el=>el.textContent==='Next').click()`)
        await until(`document.querySelector('[aria-label="Algorithm timeline"]').value==='${frame}'`)
      }
      await until(`document.querySelector('.algorithm-grid__detail').textContent.includes('Pending colors')`)
      assert.equal(await evaluate(`document.querySelector('.algorithm-grid [data-row="1"][data-column="1"] strong').textContent`), '2?')
      await evaluate(`Array.from(document.querySelectorAll('.algorithm-workspace__playback button')).find(el=>el.textContent==='Next').click()`)
      await until(`document.querySelector('.algorithm-grid [data-row="1"][data-column="1"] strong').textContent==='2'`)
      await evaluate(`Array.from(document.querySelectorAll('.algorithm-workspace__examples button')).find(el=>el.textContent==='Already filled').click()`)
      await until(`document.querySelector('[data-phase="propose"]').disabled && document.querySelector('[data-phase="commit"]').disabled`)
    }
    for (const width of [390, 1280]) {
      await call('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false })
      await delay(200)
      assert.ok(await evaluate(`Array.from(document.querySelectorAll('.algorithm-workspace__panel')).every(el=>el.clientHeight>0 && el.clientWidth>0)`), 'Panels remain visible')
    }
    const values = Array.from({length:80}, (_,i)=> i % 2 ? 80 : 79)
    const input = number === '3913' ? JSON.stringify('ae'.repeat(40)) : number === '3915' ? JSON.stringify({nums: values, k: 1})
      : number === '3905' ? JSON.stringify({n: 12, m: 12, sources: [[0,0,1],[11,11,2]]})
      : number === '3909' ? JSON.stringify(Array.from({length:80}, (_,i)=>100-Math.abs(40-i)))
      : number === '3910' ? JSON.stringify({nums: Array(13).fill(0), edges: []})
      : number === '3908' ? JSON.stringify({n: 100000, x: 0})
      : number === '3899' ? '[1,1000,1000]'
      : number === '3894' ? '1000'
      : number === '3895' ? JSON.stringify({nums: values, digit: 7})
      : ['3903', '3904'].includes(number) ? JSON.stringify({nums: values, k: 0}) : JSON.stringify(values)
    await setValue('.algorithm-workspace textarea', input, 'HTMLTextAreaElement')
    await evaluate(`document.querySelector('.algorithm-workspace button[type="submit"]').click()`)
    if (number === '3905') {
      await evaluate(`Array.from(document.querySelectorAll('.algorithm-grid nav button')).find(el=>el.textContent==='Next rows').click()`)
      await evaluate(`Array.from(document.querySelectorAll('.algorithm-grid nav button')).find(el=>el.textContent==='Next columns').click()`)
      await until(`!!document.querySelector('.algorithm-grid [data-row="11"][data-column="11"]')`)
      assert.equal(await evaluate(`document.querySelectorAll('.algorithm-grid__cells button').length`), 16)
    } else if (['3908', '3899', '3894'].includes(number)) {
      await until(`document.querySelectorAll('.algorithm-sequence strong').length===${number === '3908' ? 6 : number === '3899' ? 3 : 1}`)
    } else if (number === '3910') {
      await until(`document.querySelectorAll('[data-node]').length===13`)
      await evaluate(`document.querySelector('[data-phase="done"]').click()`)
      await until(`document.querySelector('.algorithm-workspace output').textContent==='Final count: 13'`)
      await evaluate(`Array.from(document.querySelectorAll('.algorithm-sequence button')).find(el=>el.textContent==='Next page').click()`)
      await until(`document.querySelector('[aria-label="All subset decisions (mask = index + 1)"] small').textContent==='[33]'`)
    } else {
    await until(`!!document.querySelector('.algorithm-sequence nav')`)
    await evaluate(`Array.from(document.querySelectorAll('.algorithm-sequence button')).find(el=>el.textContent==='Next page').click()`)
    await until(`document.querySelector('.algorithm-sequence small')?.textContent==='[32]'`)
    }
    if (number === '3915') {
      await evaluate(`document.querySelector('[data-phase="done"]').click()`)
      await until(`!!document.querySelector('.algorithm-path nav')`)
      await evaluate(`Array.from(document.querySelectorAll('.algorithm-path button')).find(el=>el.textContent==='Next path page').click()`)
      await until(`document.querySelector('.algorithm-path nav').textContent.includes('Page 2 / 5')`)
      assert.equal(await evaluate(`document.querySelectorAll('.algorithm-path circle').length`), 17, 'Page keeps the cross-boundary edge')
      await evaluate(`document.querySelector('[data-phase="start"]').click()`)
      await until(`!document.querySelector('.algorithm-path')`)
      assert.ok(await evaluate(`Array.from(document.querySelectorAll('[aria-label="UP: best sum ending with a rise"] strong')).every(el=>el.textContent==='?')`), 'Rewind must not reveal future DP values')
    }
    await setValue('.algorithm-workspace textarea', 'invalid', 'HTMLTextAreaElement')
    await evaluate(`document.querySelector('.algorithm-workspace button[type="submit"]').click()`)
    await until(`!!document.querySelector('.algorithm-workspace [role="alert"]')`)
    assert.equal(await evaluate(`document.querySelectorAll('.algorithm-sequence').length`), 0, 'Invalid input must not show stale results')
    await evaluate(`document.querySelector('.algorithm-workspace__examples button').click()`)
    await until(`!!document.querySelector('.algorithm-sequence') && !document.querySelector('.algorithm-workspace [role="alert"]')`)
    if (number === '3896') {
      await setValue('[aria-label="Algorithm timeline"]', '5')
      await until(`document.querySelector('[data-phase="choose"]').getAttribute('aria-current')==='step'`)
      assert.deepEqual(await evaluate(`Array.from(document.querySelectorAll('[aria-label="Candidate values (all increments to target)"] strong')).map(el=>el.textContent)`), ['2', '3', '4'])
      await evaluate(`Array.from(document.querySelectorAll('.algorithm-workspace__examples button')).find(el=>el.textContent==='Already alternating').click()`)
      await evaluate(`document.querySelector('[data-phase="done"]').click()`)
      await until(`document.querySelector('.algorithm-workspace output').textContent==='Minimum operations: 0'`)
    }
    if (number === '3895') {
      await evaluate(`Array.from(document.querySelectorAll('.algorithm-workspace__examples button')).find(el=>el.textContent==='Trailing zeros').click()`)
      await evaluate(`document.querySelector('[data-phase="extract"]').click()`)
      await until(`document.querySelector('[aria-label="Current number digits (processed right to left)"] .is-active small').textContent==='[6]'`)
      await evaluate(`document.querySelector('[data-phase="done"]').click()`)
      await until(`document.querySelector('.algorithm-workspace output').textContent==='Total occurrences: 8'`)
    }
    if (number === '3894') {
      for (const [label, result] of [['Green: 0', 'Green'], ['Orange: 30', 'Orange'], ['Red boundary: 90', 'Red'], ['Beyond red: 91', 'Invalid']]) {
        await evaluate(`Array.from(document.querySelectorAll('.algorithm-workspace__examples button')).find(el=>el.textContent==='${label}').click()`)
        await evaluate(`document.querySelector('[data-phase="done"]').click()`)
        await until(`document.querySelector('.algorithm-workspace output').textContent==='Signal: ${result}'`)
        assert.equal(await evaluate(`document.querySelectorAll('[data-light][data-active="true"]').length`), result === 'Invalid' ? 0 : 1)
      }
    }
    if (number === '3899') {
      await evaluate(`document.querySelector('[data-phase="angle"]').click()`)
      await until(`document.querySelector('[data-vertex="A"]').getAttribute('data-role')==='current-angle'`)
      for (const label of ['Degenerate', 'Cannot close']) {
        await evaluate(`Array.from(document.querySelectorAll('.algorithm-workspace__examples button')).find(el=>el.textContent==='${label}').click()`)
        await evaluate(`document.querySelector('[data-phase="done"]').click()`)
        await until(`document.querySelector('.algorithm-workspace output').textContent==='[]'`)
        assert.equal(await evaluate(`document.querySelectorAll('.algorithm-workspace polygon').length`), 0)
        assert.ok(await evaluate(`document.querySelector('[data-phase="angle"]').disabled`))
      }
    }
    if (number === '3908') {
      for (const label of ['Leading match', 'Target absent', 'Number zero']) {
        await evaluate(`Array.from(document.querySelectorAll('.algorithm-workspace__examples button')).find(el=>el.textContent==='${label}').click()`)
        await evaluate(`document.querySelector('[data-phase="done"]').click()`)
        await until(`document.querySelector('.algorithm-workspace output').textContent==='Valid: false'`)
      }
    }
    if (number === '3909') {
      for (const [label, result] of [['Ascending wins', 0], ['Equal sums', -1]]) {
        await evaluate(`Array.from(document.querySelectorAll('.algorithm-workspace__examples button')).find(el=>el.textContent==='${label}').click()`)
        await evaluate(`document.querySelector('[data-phase="done"]').click()`)
        await until(`document.querySelector('.algorithm-workspace output').textContent==='Result: ${result}'`)
        assert.equal(await evaluate(`document.querySelector('[aria-label="Descending part (peak included)"] small').textContent`), '[2]')
      }
    }
    if (['3903', '3904'].includes(number)) {
      await evaluate(`Array.from(document.querySelectorAll('.algorithm-workspace__examples button')).find(el=>el.textContent==='Threshold equality').click()`)
      await evaluate(`document.querySelector('[data-phase="done"]').click()`)
      await until(`document.querySelector('.algorithm-workspace output').textContent==='Smallest stable index: 0'`)
      assert.deepEqual(await evaluate(`Array.from(document.querySelectorAll('[aria-label="Instability scores and threshold decisions"] strong')).map(el=>el.textContent)`), ['2', '?', '?'])
      await evaluate(`Array.from(document.querySelectorAll('.algorithm-workspace__examples button')).find(el=>el.textContent==='No stable index').click()`)
      await evaluate(`document.querySelector('[data-phase="done"]').click()`)
      await until(`document.querySelector('.algorithm-workspace output').textContent==='Smallest stable index: -1'`)
    }
    console.log(`${number}: catalog, panels, floating/docked controls, collapse, state mapping, final frame, resize, paging, validation and recovery passed`)
  }
  assert.deepEqual(errors, [], 'No browser runtime exceptions')
} finally {
  ws?.close()
  chrome.kill()
}
