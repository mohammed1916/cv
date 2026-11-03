import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Independent oracle: try every number of cards l taken from the left and k - l from the right.
function oracle(cards, k) {
  const n = cards.length
  let best = -Infinity
  for (let l = 0; l <= k; l++) {
    let total = 0
    for (let i = 0; i < l; i++) total += cards[i]
    for (let i = 0; i < k - l; i++) total += cards[n - 1 - i]
    best = Math.max(best, total)
  }
  return best
}

test('sample inputs give the best total', () => {
  assert.equal(buildTrace({ cards: [3, 1, 6, 8, 2, 9], k: 3 }).result, 19)
  assert.equal(buildTrace({ cards: [5, 7, 1, 9], k: 2 }).result, 14)
  assert.equal(buildTrace({ cards: [4, 4, 4], k: 3 }).result, 12)
})

test('the window never takes a card twice when k equals the length', () => {
  assert.equal(buildTrace({ cards: [2, -1, 5], k: 3 }).result, 6)
})

test('random inputs agree with the independent oracle', () => {
  let state = 21
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 400; t++) {
    const n = 1 + rand(12)
    const cards = Array.from({ length: n }, () => rand(41) - 20)
    const k = 1 + rand(n)
    assert.equal(buildTrace({ cards, k }).result, oracle(cards, k), JSON.stringify({ cards, k }))
  }
})

test('every frame names a valid phase and a code line inside the solver', () => {
  const ids = new Set(phases.map(p => p.id))
  const run = buildTrace({ cards: [1, 2, 3, 4, 5], k: 2 })
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.message.length > 5)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
  }
  assert.equal(run.frames.at(-1).phase, 'result')
  assert.equal(code.length, python.split('\n').length)
})

test('invalid input is rejected with a readable message', () => {
  assert.throws(() => parseInput('[1,2]'), /object/)
  assert.throws(() => parseInput('{"cards":[1,2],"k":3}'), /k must be from 1 to 2/)
  assert.throws(() => parseInput('{"cards":[1,2.5],"k":1}'), /integer/)
  assert.throws(() => parseInput('{"cards":[],"k":1}'), /1 to 1000/)
})
