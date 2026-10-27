import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

// Independent oracle: try every subset of k prices and keep the best smallest adjacent gap.
function oracle({ price, k }) {
  const s = [...price].sort((a, b) => a - b)
  let best = -1
  const choose = (start, chosen) => {
    if (chosen.length === k) {
      let gap = Infinity
      for (let i = 1; i < chosen.length; i++) gap = Math.min(gap, chosen[i] - chosen[i - 1])
      best = Math.max(best, gap)
      return
    }
    for (let i = start; i < s.length; i++) choose(i + 1, [...chosen, s[i]])
  }
  choose(0, [])
  return best
}

test('2517 official examples', () => {
  assert.equal(solve({ price: [13, 5, 1, 8, 21, 2], k: 3 }), 8)
  assert.equal(solve({ price: [1, 3, 1], k: 2 }), 2)
})

test('2517 equal prices and the whole array', () => {
  assert.equal(solve({ price: [7, 7, 7, 7], k: 4 }), 0)
  assert.equal(solve({ price: [1, 50], k: 2 }), 49)
})

test('2517 rejects bad input', () => {
  assert.throws(() => parseInput('{"price":[1],"k":2}'))
  assert.throws(() => parseInput('{"price":[1,2,3],"k":4}'))
  assert.throws(() => parseInput('{"price":[1,51],"k":2}'))
})

test('2517 random baskets match a subset oracle', () => {
  let seed = 2517
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(6)
    const price = Array.from({ length: n }, () => 1 + rnd(30))
    const k = 2 + rnd(n - 1)
    assert.equal(solve({ price, k }), oracle({ price, k }), JSON.stringify({ price, k }))
  }
})
