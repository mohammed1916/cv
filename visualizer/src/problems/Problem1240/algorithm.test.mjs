import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1240 official examples', () => {
  assert.equal(solve({ n: 2, m: 3 }), 3)
  assert.equal(solve({ n: 5, m: 8 }), 5)
})

test('1240 a square needs one square and a 1 by 7 strip needs seven', () => {
  assert.equal(solve({ n: 4, m: 4 }), 1)
  assert.equal(solve({ n: 1, m: 7 }), 7)
})

test('1240 rejects sizes outside 1 to 8', () => {
  assert.throws(() => parseInput('{"n":0,"m":3}'))
  assert.throws(() => parseInput('{"n":9,"m":3}'))
})

// Independent oracle: breadth-first search over bitmasks of covered cells, one square per level.
function oracle(n, m) {
  const full = (1 << (n * m)) - 1
  const seen = new Set([0])
  let frontier = [0]
  for (let depth = 0; ; depth++) {
    const next = []
    for (const state of frontier) {
      if (state === full) return depth
      let cell = 0
      while ((state >> cell) & 1) cell++
      const r = Math.floor(cell / m)
      const c = cell % m
      for (let s = 1; r + s <= n && c + s <= m; s++) {
        let mask = 0
        let clash = false
        for (let i = 0; i < s; i++) for (let j = 0; j < s; j++) {
          const bit = (r + i) * m + c + j
          if ((state >> bit) & 1) clash = true
          mask |= 1 << bit
        }
        if (clash) break
        const after = state | mask
        if (!seen.has(after)) {
          seen.add(after)
          next.push(after)
        }
      }
    }
    frontier = next
  }
}

test('1240 small rectangles match a bitmask breadth-first oracle', () => {
  let seed = 1240
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rnd(4)
    const m = 1 + rnd(4)
    assert.equal(solve({ n, m }), oracle(n, m), `${n}x${m}`)
  }
})
