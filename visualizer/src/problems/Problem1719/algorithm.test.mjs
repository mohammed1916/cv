import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = pairs => buildTrace(parseInput(JSON.stringify({ pairs }))).result

test('1719 worked examples', () => {
  // 2 must be the root, with 1 and 3 below it in either arrangement that keeps them unrelated.
  assert.equal(solve([[1, 2], [2, 3]]), 1)
  // Three values that are all related form a chain, and a chain can be ordered in more than one way.
  assert.equal(solve([[1, 2], [2, 3], [1, 3]]), 2)
  // Two separate pairs cannot sit in one rooted tree.
  assert.equal(solve([[1, 2], [3, 4]]), 0)
})

test('1719 rejects a repeated pair and a pair that is not ordered', () => {
  assert.throws(() => parseInput('{"pairs":[[1,2],[1,2]]}'))
  assert.throws(() => parseInput('{"pairs":[[2,1]]}'))
})

// Independent oracle: enumerate every parent array on the values, keep the single-root trees whose
// related pairs are exactly the given pairs, and count them (capped at two).
function oracle(pairs) {
  const nodes = [...new Set(pairs.flat())].sort((a, b) => a - b)
  const N = nodes.length
  const idx = new Map(nodes.map((v, i) => [v, i]))
  const key = (a, b) => `${Math.min(a, b)}-${Math.max(a, b)}`
  const wanted = new Set(pairs.map(([x, y]) => key(idx.get(x), idx.get(y))))
  const parent = Array(N).fill(-1)
  let count = 0
  const check = () => {
    if (parent.filter(p => p === -1).length !== 1) return
    const related = new Set()
    for (let i = 0; i < N; i++) {
      let p = parent[i], steps = 0
      while (p !== -1) {
        if (++steps > N) return
        related.add(key(i, p))
        p = parent[p]
      }
    }
    if (related.size === wanted.size && [...wanted].every(k => related.has(k))) count++
  }
  const choose = i => {
    if (i === N) { check(); return }
    for (let p = -1; p < N; p++) {
      if (p === i) continue
      parent[i] = p
      choose(i + 1)
    }
  }
  choose(0)
  return Math.min(count, 2)
}

test('1719 random relations match an enumeration oracle', () => {
  let seed = 1719
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 250; t++) {
    const N = 2 + rnd(4)
    const labels = Array.from({ length: N }, (_, i) => i + 1)
    for (let i = N - 1; i > 0; i--) { const j = rnd(i + 1); [labels[i], labels[j]] = [labels[j], labels[i]] }
    const up = Array(N).fill(-1)
    for (let i = 1; i < N; i++) up[i] = rnd(i)
    const pairs = []
    for (let i = 0; i < N; i++) {
      let p = up[i]
      while (p !== -1) { pairs.push([Math.min(labels[i], labels[p]), Math.max(labels[i], labels[p])]); p = up[p] }
    }
    if (rnd(3) === 0) pairs.splice(rnd(pairs.length), 1)
    if (rnd(4) === 0) {
      const a = 1 + rnd(N), b = 1 + rnd(N)
      if (a !== b) pairs.push([Math.min(a, b), Math.max(a, b)])
    }
    const unique = [...new Map(pairs.map(p => [p.join('-'), p])).values()]
    if (unique.length === 0) continue
    assert.equal(solve(unique), oracle(unique), JSON.stringify(unique))
  }
})
