import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: for each item, scan right for the first price no higher than its own.
function oracle(prices) {
  return prices.map((p, i) => {
    for (let j = i + 1; j < prices.length; j++) if (prices[j] <= p) return p - prices[j]
    return p
  })
}

test('small hand-checked shops', () => {
  assert.deepEqual(buildTrace([5, 2, 4, 1, 3]).result, [3, 1, 3, 1, 3])
  assert.deepEqual(buildTrace([6, 6, 6]).result, [0, 0, 6])
  assert.deepEqual(buildTrace([1, 2, 3, 4]).result, [1, 2, 3, 4])
})

test('random shops agree with the scan oracle', () => {
  let state = 11
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const prices = Array.from({ length: 1 + rand(25) }, () => 1 + rand(12))
    assert.deepEqual(buildTrace(prices).result, oracle(prices), JSON.stringify(prices))
  }
})

test('frames end with done and the waiting stack never holds a value out of order', () => {
  const run = buildTrace([4, 9, 2, 7, 3, 8])
  assert.equal(run.frames.at(-1).phase, 'done')
  for (const frame of run.frames) {
    const w = frame.scene.waiting.map(i => run.input[i])
    for (let k = 1; k < w.length; k++) assert.ok(w[k - 1] < w[k])
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= 9)
  }
})

test('invalid input is rejected with a readable message', () => {
  assert.throws(() => parseInput('[]'), /1 to 200/)
  assert.throws(() => parseInput('[0]'), /1 to 1000/)
  assert.throws(() => parseInput('[2.5]'), /integer/)
  assert.throws(() => parseInput('{"a":1}'), /JSON array/)
})
