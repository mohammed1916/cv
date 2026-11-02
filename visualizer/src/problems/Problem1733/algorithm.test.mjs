import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, languages, friendships) => buildTrace({ n, languages, friendships }).result

test('1733 worked examples', () => {
  assert.equal(solve(2, [[1], [2], [1, 2]], [[1, 2], [1, 3], [2, 3]]), 1)
  assert.equal(solve(3, [[1, 3], [2], [1, 2], [3]], [[1, 3], [2, 3]]), 0)
})

test('1733 edge cases: a single language and no friendships', () => {
  assert.equal(solve(1, [[1], [1]], [[1, 2]]), 0)
  assert.equal(solve(2, [[1], [2]], []), 0)
  assert.equal(solve(2, [[1], [2]], [[1, 2]]), 1)
})

test('1733 rejects malformed input', () => {
  assert.throws(() => parseInput('{"n":2,"languages":[[3],[1]],"friendships":[]}'))
  assert.throws(() => parseInput('{"n":2,"languages":[[1],[2]],"friendships":[[1,1]]}'))
})

// Oracle: try every language and every subset of users to teach it to.
function oracle(n, languages, friendships) {
  const m = languages.length
  let best = Infinity
  for (let lang = 1; lang <= n; lang++) {
    for (let mask = 0; mask < 1 << m; mask++) {
      const knowsAfter = (u, l) => languages[u].includes(l) || (l === lang && (mask >> u & 1) === 1)
      const ok = friendships.every(([a, b]) => {
        for (let l = 1; l <= n; l++) if (knowsAfter(a - 1, l) && knowsAfter(b - 1, l)) return true
        return false
      })
      if (ok) best = Math.min(best, [...Array(m).keys()].filter(u => mask >> u & 1).length)
    }
  }
  return best
}

test('1733 random inputs match a brute-force oracle', () => {
  let seed = 1733
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rnd(3)
    const m = 2 + rnd(3)
    const languages = Array.from({ length: m }, () => {
      const set = new Set([1 + rnd(n)])
      if (rnd(2)) set.add(1 + rnd(n))
      return [...set]
    })
    const friendships = []
    for (let a = 1; a <= m; a++) for (let b = a + 1; b <= m; b++) if (rnd(3) === 0) friendships.push([a, b])
    assert.equal(solve(n, languages, friendships), oracle(n, languages, friendships), JSON.stringify({ n, languages, friendships }))
  }
})
