import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = mat => buildTrace(mat).result

test('3044 worked examples', () => {
  assert.equal(solve([[1, 1], [9, 9], [1, 1]]), 19)
  assert.equal(solve([[7]]), -1)
  assert.equal(solve([[9, 7, 8], [4, 6, 5], [2, 8, 6]]), 97)
})

test('3044 edge cases', () => {
  assert.equal(solve([[0]]), -1)
  assert.equal(solve([[1, 1]]), 11)
  assert.throws(() => parseInput('[[10]]'))
})

// Independent oracle: build each straight digit string as text and test primality with a sieve.
function oracle(mat) {
  const m = mat.length, n = mat[0].length
  const limit = 10 ** Math.max(m, n)
  const sieve = Array(limit).fill(true)
  sieve[0] = sieve[1] = false
  for (let i = 2; i * i < limit; i++) if (sieve[i]) for (let j = i * i; j < limit; j += i) sieve[j] = false
  const count = new Map()
  for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    if (dr === 0 && dc === 0) continue
    let text = ''
    for (let k = 0; ; k++) {
      const rr = r + dr * k, cc = c + dc * k
      if (rr < 0 || rr >= m || cc < 0 || cc >= n) break
      text += String(mat[rr][cc])
      const value = Number(text)
      if (value > 10 && sieve[value]) count.set(value, (count.get(value) ?? 0) + 1)
    }
  }
  let best = -1, bestCount = 0
  for (const [value, c] of count) if (c > bestCount || (c === bestCount && value > best)) { best = value; bestCount = c }
  return best
}

test('3044 small grids match the string-based oracle', () => {
  let seed = 3044
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const m = 1 + rnd(3), n = 1 + rnd(3)
    const mat = Array.from({ length: m }, () => Array.from({ length: n }, () => rnd(10)))
    assert.equal(solve(mat), oracle(mat), JSON.stringify(mat))
  }
})
