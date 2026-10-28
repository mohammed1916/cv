import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, a, b) => buildTrace(parseInput(JSON.stringify({ s, a, b }))).result

test('1625 examples', () => {
  assert.equal(solve('5525', 9, 2), '2050')
  assert.equal(solve('74', 5, 1), '24')
  assert.equal(solve('0011', 4, 2), '0011')
})

test('1625 rejects odd length and b out of range', () => {
  assert.throws(() => parseInput('{"s":"123","a":1,"b":1}'))
  assert.throws(() => parseInput('{"s":"12","a":1,"b":2}'))
})

// Independent oracle: grow the reachable set until nothing new appears (a fixed-point loop, not a queue).
function oracle(s, a, b) {
  const n = s.length
  const reach = new Set([s])
  let changed = true
  while (changed) {
    changed = false
    for (const t of [...reach]) {
      const added = [...t].map((ch, i) => (i % 2 === 1 ? String((Number(ch) + a) % 10) : ch)).join('')
      const rotated = t.slice(n - b) + t.slice(0, n - b)
      for (const u of [added, rotated]) {
        if (!reach.has(u)) {
          reach.add(u)
          changed = true
        }
      }
    }
  }
  return [...reach].sort()[0]
}

test('1625 random inputs match a fixed-point oracle', () => {
  let seed = 1625
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const len = 2 * (1 + rnd(4))
    let s = ''
    for (let i = 0; i < len; i++) s += String(rnd(10))
    const a = 1 + rnd(9)
    const b = 1 + rnd(len - 1)
    assert.equal(solve(s, a, b), oracle(s, a, b), `${s} ${a} ${b}`)
  }
})
