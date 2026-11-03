import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Independent reference: recursive depth-first search over the same jump rule.
function reference({ arr, start }) {
  const visited = new Set()
  const dfs = i => {
    if (i < 0 || i >= arr.length || visited.has(i)) return false
    if (arr[i] === 0) return true
    visited.add(i)
    return dfs(i + arr[i]) || dfs(i - arr[i])
  }
  return dfs(start)
}

test('reachable zero example', () => {
  assert.equal(buildTrace({ arr: [4, 2, 3, 0, 3, 1, 2], start: 5 }).result, true)
})

test('cycle without zero example', () => {
  assert.equal(buildTrace({ arr: [3, 0, 2, 1, 2], start: 0 }).result, false)
})

test('start on zero is immediately true', () => {
  assert.equal(buildTrace({ arr: [0], start: 0 }).result, true)
})

test('random arrays agree with the depth-first reference', () => {
  let state = 23
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 400; t++) {
    const arr = Array.from({ length: 1 + rand(10) }, () => rand(5))
    const input = { arr, start: rand(arr.length) }
    assert.equal(buildTrace(input).result, reference(input), JSON.stringify(input))
  }
})

test('every frame names a real phase and a code line inside the solver', () => {
  const ids = new Set(phases.map(p => p.id))
  for (const input of [{ arr: [4, 2, 3, 0, 3, 1, 2], start: 5 }, { arr: [3, 0, 2, 1, 2], start: 0 }]) {
    const run = buildTrace(input)
    for (const frame of run.frames) {
      assert.ok(ids.has(frame.phase))
      assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, `line for ${frame.phase}`)
      assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length, `python for ${frame.phase}`)
      assert.ok(frame.message.length > 10)
    }
    assert.equal(run.frames.at(-1).phase, 'done')
  }
})

test('invalid input is rejected with a readable message', () => {
  assert.throws(() => parseInput('[1]'), /Use an object/)
  assert.throws(() => parseInput('{"arr":[1,2],"start":2}'), /start is an index/)
  assert.throws(() => parseInput('{"arr":[-1],"start":0}'), /arr is a list/)
})
