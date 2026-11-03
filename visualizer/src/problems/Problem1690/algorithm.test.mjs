import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

// Independent oracle: plain recursion over the remaining stones, no table.
function oracle(stones) {
  const sumOf = list => list.reduce((a, b) => a + b, 0)
  function value(list) {
    if (list.length <= 1) return 0
    let best = -Infinity
    const removeLeft = list.slice(1)
    best = Math.max(best, sumOf(removeLeft) - value(removeLeft))
    const removeRight = list.slice(0, -1)
    best = Math.max(best, sumOf(removeRight) - value(removeRight))
    return best
  }
  return value(stones)
}

test('1690 sample rows match the recursion oracle', () => {
  assert.equal(buildTrace([4, 9, 2, 7]).result, oracle([4, 9, 2, 7]))
  assert.equal(buildTrace([3, 1, 8, 2, 6]).result, oracle([3, 1, 8, 2, 6]))
  assert.equal(buildTrace([5]).result, 0)
})

test('1690 random rows of up to 9 stones match the recursion oracle', () => {
  let seed = 3
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 150; t++) {
    const n = 1 + rnd(9)
    const stones = Array.from({ length: n }, () => 1 + rnd(100))
    assert.equal(buildTrace(stones).result, oracle(stones), JSON.stringify(stones))
  }
})

test('1690 rejects malformed input', () => {
  assert.throws(() => parseInput('[]'), /1 to 16/)
  assert.throws(() => parseInput('[0,3]'), /1 to 16/)
  assert.throws(() => parseInput('{"a":1}'), /1 to 16/)
})

test('1690 frames use declared phases and carry line numbers', () => {
  const ids = new Set(phases.map(p => p.id))
  for (const frame of buildTrace([2, 7, 1, 8]).frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.pythonLine >= 1)
  }
})
