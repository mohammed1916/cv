import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, relations, k) => buildTrace(parseInput(JSON.stringify({ n, relations, k }))).result

test('1494 official examples', () => {
  assert.equal(solve(4, [[2, 1], [3, 1], [1, 4]], 2), 3)
  assert.equal(solve(5, [[2, 1], [3, 1], [4, 1], [1, 5]], 2), 4)
})

test('1494 no prerequisites and a chain', () => {
  assert.equal(solve(5, [], 2), 3)
  assert.equal(solve(3, [[1, 2], [2, 3]], 3), 3)
})

test('1494 rejects bad input', () => {
  assert.throws(() => parseInput('{"n":2,"relations":[[1,2],[2,1]],"k":1}'))
  assert.throws(() => parseInput('{"n":2,"relations":[[1,3]],"k":1}'))
  assert.throws(() => parseInput('{"n":2,"relations":[],"k":3}'))
})

// Independent oracle: a breadth-first search over sets of finished courses where each semester
// may take ANY non-empty group of ready courses of size at most k, not only the largest allowed group.
function oracle(n, relations, k) {
  const need = Array(n).fill(0)
  for (const [a, b] of relations) need[b - 1] |= 1 << (a - 1)
  const full = (1 << n) - 1
  let level = new Set([0])
  const reached = new Set([0])
  let semesters = 0
  while (!level.has(full)) {
    semesters++
    const next = new Set()
    for (const taken of level) {
      const ready = []
      for (let i = 0; i < n; i++) if (!(taken & (1 << i)) && (need[i] & taken) === need[i]) ready.push(i)
      const expand = (start, mask, size) => {
        if (size > 0) {
          const grown = taken | mask
          if (!reached.has(grown)) { reached.add(grown); next.add(grown) }
        }
        if (size === k) return
        for (let j = start; j < ready.length; j++) expand(j + 1, mask | (1 << ready[j]), size + 1)
      }
      expand(0, 0, 0)
    }
    level = next
  }
  return semesters
}

test('1494 random DAGs match the arbitrary-subset oracle', () => {
  let seed = 1494
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(7)
    const relations = []
    for (let a = 1; a <= n; a++) for (let b = a + 1; b <= n; b++) if (rnd(3) === 0) relations.push([a, b])
    const k = 1 + rnd(n)
    assert.equal(solve(n, relations, k), oracle(n, relations, k), JSON.stringify({ n, relations, k }))
  }
})
