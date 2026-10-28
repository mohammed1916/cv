import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (forbidden, a, b, x) => buildTrace(parseInput(JSON.stringify({ forbidden, a, b, x }))).result

test('1654 official examples', () => {
  assert.equal(solve([14, 4, 18, 1, 15], 3, 15, 9), 3)
  assert.equal(solve([8, 3, 16, 6, 12, 20], 15, 13, 11), -1)
  assert.equal(solve([1, 6, 2, 14, 5, 17, 4], 16, 9, 7), 2)
})

test('1654 a backward jump is used after a forward one', () => {
  // 0 -> 3 -> 6 -> 4 (back 2): three jumps, since 1 is forbidden and 3 -> 1 is blocked.
  assert.equal(solve([1], 3, 2, 4), 3)
})

test('1654 rejects a forbidden target', () => {
  assert.throws(() => parseInput('{"forbidden":[5],"a":1,"b":1,"x":5}'))
})

// Independent oracle: Bellman-Ford style relaxation over positions 0 to 300 with a flag for a backward last jump.
function oracle(forbidden, a, b, x) {
  const LIM = 300
  const bad = new Set(forbidden)
  const dist = Array.from({ length: LIM + 1 }, () => [Infinity, Infinity])
  dist[0][0] = 0
  let changed = true
  while (changed) {
    changed = false
    for (let p = 0; p <= LIM; p++) {
      for (const f of [0, 1]) {
        const d = dist[p][f]
        if (d === Infinity) continue
        const fw = p + a
        if (fw <= LIM && !bad.has(fw) && d + 1 < dist[fw][0]) {
          dist[fw][0] = d + 1
          changed = true
        }
        const bk = p - b
        if (f === 0 && bk >= 0 && !bad.has(bk) && d + 1 < dist[bk][1]) {
          dist[bk][1] = d + 1
          changed = true
        }
      }
    }
  }
  const best = Math.min(dist[x][0], dist[x][1])
  return best === Infinity ? -1 : best
}

test('1654 random inputs match a relaxation oracle', () => {
  let seed = 1654
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const x = 1 + rnd(30)
    const pool = []
    for (let p = 1; p <= 30; p++) if (p !== x) pool.push(p)
    const forbidden = []
    const count = 1 + rnd(10)
    while (forbidden.length < count) {
      const p = pool[rnd(pool.length)]
      if (!forbidden.includes(p)) forbidden.push(p)
    }
    const a = 1 + rnd(10)
    const b = 1 + rnd(10)
    assert.equal(solve(forbidden, a, b, x), oracle(forbidden, a, b, x), JSON.stringify({ forbidden, a, b, x }))
  }
})
