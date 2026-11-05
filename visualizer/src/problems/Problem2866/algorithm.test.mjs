import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = maxHeights => buildTrace(parseInput(JSON.stringify({ maxHeights }))).result
const PY = python.split('\n')

test('2866 worked examples', () => {
  assert.equal(solve([5, 3, 4, 1, 1]), 13)
  assert.equal(solve([6, 5, 3, 9, 2, 7]), 22)
  assert.equal(solve([3, 2, 5, 5, 2, 3]), 18)
})

test('2866 frames point at real python lines', () => {
  for (const f of buildTrace({ maxHeights: [2, 4, 1, 3] }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2866 rejects heights out of range', () => {
  assert.throws(() => parseInput('{"maxHeights":[0,1]}'))
})

// Oracle: for every peak, cap each side with running minima, without any stack.
function oracle(h) {
  let best = 0
  for (let i = 0; i < h.length; i++) {
    let total = h[i]
    let m = h[i]
    for (let k = i - 1; k >= 0; k--) { m = Math.min(m, h[k]); total += m }
    m = h[i]
    for (let k = i + 1; k < h.length; k++) { m = Math.min(m, h[k]); total += m }
    best = Math.max(best, total)
  }
  return best
}

test('2866 random arrays match an oracle', () => {
  let seed = 2866
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % m }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(9)
    const h = Array.from({ length: n }, () => 1 + rnd(12))
    assert.equal(solve(h), oracle(h), JSON.stringify(h))
  }
})
