import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Independent oracle: one left-to-right pass. If no streak reaches k in that pass, the maximum wins every later duel.
function oracle(arr, k) {
  let champion = arr[0]
  let streak = 0
  for (let i = 1; i < arr.length; i++) {
    if (champion > arr[i]) streak += 1
    else { champion = arr[i]; streak = 1 }
    if (streak === k) return champion
  }
  return Math.max(...arr)
}

test('1535 sample inputs give the expected winners', () => {
  assert.equal(buildTrace({ arr: [1, 4, 2, 3], k: 2 }).result, 4)
  assert.equal(buildTrace({ arr: [5, 1, 3, 2], k: 3 }).result, 5)
  assert.equal(buildTrace({ arr: [2, 9, 4], k: 1 }).result, 9)
})

test('1535 random arrays match the one-pass oracle', () => {
  let seed = 21
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(9)
    const pool = Array.from({ length: 30 }, (_, i) => i + 1)
    const arr = []
    for (let i = 0; i < n; i++) arr.push(pool.splice(rnd(pool.length), 1)[0])
    const k = 1 + rnd(10)
    assert.equal(buildTrace({ arr, k }).result, oracle(arr, k), JSON.stringify({ arr, k }))
  }
})

test('1535 rejects malformed input', () => {
  assert.throws(() => parseInput('{"arr":[1,1,2],"k":2}'), /distinct/)
  assert.throws(() => parseInput('{"arr":[1],"k":2}'), /2 to 12/)
  assert.throws(() => parseInput('{"arr":[1,2],"k":0}'), /k is/)
})

test('1535 frames use declared phases and lines inside the solver', () => {
  const run = buildTrace({ arr: [1, 4, 2, 3], k: 2 })
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.message.length > 10)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
