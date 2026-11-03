import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, k) => buildTrace({ s, k }).result

test('3666 worked examples', () => {
  assert.equal(solve('0010', 3), 1)
  assert.equal(solve('00101', 5), -1)
  assert.equal(solve('1111', 2), 0)
})

test('3666 rejects malformed input', () => {
  assert.throws(() => parseInput('{"s":"012","k":1}'))
  assert.throws(() => parseInput('{"s":"01","k":3}'))
})

// Oracle: breadth-first search over every bit pattern, trying every set of k positions.
function oracle(s, k) {
  const n = s.length
  const start = parseInt([...s].reverse().join(''), 2)
  const full = (1 << n) - 1
  const masks = []
  for (let m = 0; m <= full; m++) if (popcount(m) === k) masks.push(m)
  const dist = new Map([[start, 0]])
  const queue = [start]
  for (let h = 0; h < queue.length; h++) {
    const cur = queue[h]
    if (cur === full) return dist.get(cur)
    for (const m of masks) {
      const next = cur ^ m
      if (!dist.has(next)) { dist.set(next, dist.get(cur) + 1); queue.push(next) }
    }
  }
  return -1
}
const popcount = m => { let c = 0; for (; m; m &= m - 1) c++; return c }

test('3666 matches the brute-force oracle on short strings', () => {
  for (let n = 1; n <= 6; n++) {
    for (let bits = 0; bits < 1 << n; bits++) {
      const s = Array.from({ length: n }, (_, i) => (bits >> i) & 1).join('')
      for (let k = 1; k <= n; k++) assert.equal(solve(s, k), oracle(s, k), `s=${s} k=${k}`)
    }
  }
})
