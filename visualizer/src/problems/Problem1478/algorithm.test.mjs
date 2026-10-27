import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (houses, k) => buildTrace(parseInput(JSON.stringify({ houses, k }))).result

test('1478 official examples', () => {
  assert.equal(solve([1, 4, 8, 10, 20], 3), 5)
  assert.equal(solve([2, 3, 5, 12, 18], 2), 9)
})

test('1478 one mailbox sits at the median and every house can have its own', () => {
  assert.equal(solve([7, 4, 6], 1), 3)
  assert.equal(solve([3, 9, 1], 3), 0)
})

test('1478 rejects bad input', () => {
  assert.throws(() => parseInput('{"houses":[1,1],"k":1}'))
  assert.throws(() => parseInput('{"houses":[1,2],"k":3}'))
  assert.throws(() => parseInput('{"houses":[0],"k":1}'))
})

// Independent oracle: an optimal mailbox can stand on a house, so try every set of k houses as mailbox sites.
function oracle(houses, k) {
  let best = Infinity
  const choose = (start, chosen) => {
    if (chosen.length === k) {
      const total = houses.reduce((sum, house) => sum + Math.min(...chosen.map(site => Math.abs(house - site))), 0)
      best = Math.min(best, total)
      return
    }
    for (let i = start; i < houses.length; i++) choose(i + 1, [...chosen, houses[i]])
  }
  choose(0, [])
  return best
}

test('1478 random layouts match the site-subset oracle', () => {
  let seed = 1478
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const count = 1 + rnd(7)
    const pool = Array.from({ length: 30 }, (_, i) => i + 1)
    const houses = Array.from({ length: count }, () => pool.splice(rnd(pool.length), 1)[0])
    const k = 1 + rnd(count)
    assert.equal(solve(houses, k), oracle(houses, k), JSON.stringify({ houses, k }))
  }
})
