import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2612 official-style examples', () => {
  assert.deepEqual(solve({ n: 4, p: 0, banned: [1, 2], k: 4 }), [0, -1, -1, 1])
  assert.deepEqual(solve({ n: 4, p: 2, banned: [0, 1, 3], k: 1 }), [-1, -1, 0, -1])
})

test('2612 rejects a banned start and a window longer than the array', () => {
  assert.throws(() => parseInput('{"n":3,"p":1,"banned":[1],"k":1}'), /banned/)
  assert.throws(() => parseInput('{"n":3,"p":0,"banned":[],"k":4}'))
})

// Independent oracle: breadth-first search over whole 0/1 arrays, applying each real window reversal.
function oracle({ n, p, banned, k }) {
  const bad = new Set(banned)
  const key = a => a.join('')
  const start = Array.from({ length: n }, (_, i) => (i === p ? 1 : 0))
  const dist = new Map([[key(start), 0]])
  const queue = [start]
  for (let h = 0; h < queue.length; h++) {
    const arr = queue[h]
    const d = dist.get(key(arr))
    for (let s = 0; s + k <= n; s++) {
      const next = arr.slice()
      for (let a = s, b = s + k - 1; a < b; a++, b--) [next[a], next[b]] = [next[b], next[a]]
      if (next.some((v, i) => v === 1 && bad.has(i))) continue
      const kk = key(next)
      if (!dist.has(kk)) { dist.set(kk, d + 1); queue.push(next) }
    }
  }
  return Array.from({ length: n }, (_, i) => {
    const single = Array.from({ length: n }, (_, j) => (j === i ? 1 : 0))
    return dist.has(key(single)) ? dist.get(key(single)) : -1
  })
}

test('2612 random cases match a reversal-simulation oracle', () => {
  let seed = 2612
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(7)
    const p = rnd(n)
    const banned = []
    for (let i = 0; i < n; i++) if (i !== p && rnd(3) === 0) banned.push(i)
    const k = 1 + rnd(n)
    const input = { n, p, banned, k }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})
