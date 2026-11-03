import test from 'node:test'
import assert from 'node:assert/strict'
import { existenceQueries, bruteForceQuery } from './algorithm.js'

test('1724 a chain of edges answers each limit', () => {
  const edges = [[0, 1, 3], [1, 2, 1], [2, 3, 6]]
  const queries = [[0, 2, 4], [0, 2, 2], [0, 3, 7], [3, 0, 6]]
  assert.deepEqual(existenceQueries(4, edges, queries), [true, false, true, false])
})

test('1724 answers keep the original query order', () => {
  const edges = [[0, 1, 5]]
  assert.deepEqual(existenceQueries(3, edges, [[0, 1, 9], [0, 1, 1], [1, 0, 6]]), [true, false, true])
})

test('1724 matches a brute-force search on seeded random graphs', () => {
  let seed = 7
  const rand = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % m }
  for (let round = 0; round < 60; round++) {
    const n = 2 + rand(6)
    const edges = Array.from({ length: rand(8) }, () => {
      let a = rand(n), b = rand(n)
      if (a === b) b = (a + 1) % n
      return [a, b, 1 + rand(10)]
    })
    const queries = Array.from({ length: 6 }, () => {
      let p = rand(n), q = rand(n)
      if (p === q) q = (p + 1) % n
      return [p, q, 1 + rand(11)]
    })
    const expected = queries.map(([p, q, l]) => bruteForceQuery(n, edges, p, q, l))
    assert.deepEqual(existenceQueries(n, edges, queries), expected)
  }
})
