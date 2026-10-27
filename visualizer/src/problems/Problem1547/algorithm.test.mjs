import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1547 official examples', () => {
  assert.equal(solve({ n: 7, cuts: [1, 3, 4, 5] }), 16)
  assert.equal(solve({ n: 9, cuts: [5, 6, 1, 4, 2] }), 22)
})

test('1547 one cut costs the whole stick', () => {
  assert.equal(solve({ n: 5, cuts: [2] }), 5)
})

test('1547 rejects a cut at an end of the stick', () => {
  assert.throws(() => parseInput('{"n":5,"cuts":[5]}'))
})

// Independent oracle: recurse on the cuts inside each piece, trying each as the first cut, with no table.
function oracle(n, cuts) {
  const cost = (lo, hi, inside) => {
    if (inside.length === 0) return 0
    let best = Infinity
    for (const c of inside) {
      const left = inside.filter(x => x < c)
      const right = inside.filter(x => x > c)
      best = Math.min(best, (hi - lo) + cost(lo, c, left) + cost(c, hi, right))
    }
    return best
  }
  return cost(0, n, [...cuts])
}

test('1547 seeded random sticks match a recursive oracle', () => {
  let seed = 1547
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(19)
    const pool = Array.from({ length: n - 1 }, (_, i) => i + 1)
    const cuts = []
    for (let c = 1 + rnd(6); c > 0 && pool.length; c--) cuts.push(pool.splice(rnd(pool.length), 1)[0])
    const input = { n, cuts }
    assert.equal(solve(input), oracle(n, cuts), JSON.stringify(input))
  }
})
