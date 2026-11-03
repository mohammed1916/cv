import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const sorted = a => a.every((v, i) => i === 0 || a[i - 1] <= v)

// Brute force: try every contiguous block (shortest first) and keep the first whose removal leaves a sorted array.
function brute(arr) {
  const n = arr.length
  for (let len = 0; len <= n; len++) {
    for (let start = 0; start + len <= n; start++) {
      const rest = [...arr.slice(0, start), ...arr.slice(start + len)]
      if (sorted(rest)) return len
    }
  }
  return n
}

test('own sample arrays match brute force', () => {
  for (const arr of [[4, 3, 1, 2, 6, 5, 1, 9], [1, 2, 8, 3, 5], [5, 1, 2, 3, 9], [1, 2, 3]]) {
    assert.equal(buildTrace(arr).result, brute(arr), JSON.stringify(arr))
  }
})

test('an already sorted array needs no removal', () => {
  assert.equal(buildTrace([0, 1, 1, 4]).result, 0)
})

test('random arrays agree with brute force', () => {
  let state = 13
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const arr = Array.from({ length: 1 + rand(9) }, () => rand(6))
    assert.equal(buildTrace(arr).result, brute(arr), JSON.stringify(arr))
  }
})

test('every frame names a real code line, a Python line and a known phase', () => {
  for (const arr of [[4, 3, 1, 2, 6], [0, 1, 2]]) {
    const run = buildTrace(arr)
    for (const frame of run.frames) {
      assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, frame.message)
      assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length, frame.message)
      assert.ok(phases.some(p => p.id === frame.phase))
    }
    assert.equal(run.frames.at(-1).phase, 'done')
  }
})

test('parseInput rejects values outside the digit range', () => {
  assert.throws(() => parseInput('[1,10]'), /0 to 9/)
  assert.throws(() => parseInput('[]'))
})
