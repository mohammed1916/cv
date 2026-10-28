import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (ranks, suits) => buildTrace(parseInput(JSON.stringify({ ranks, suits }))).result

test('2347 examples', () => {
  assert.equal(solve([13, 2, 3, 1, 9], ['a', 'a', 'a', 'a', 'a']), 'Flush')
  assert.equal(solve([4, 4, 2, 6, 10], ['a', 'b', 'c', 'd', 'a']), 'Pair')
  assert.equal(solve([10, 10, 2, 12, 9], ['a', 'a', 'a', 'a', 'a']), 'Flush')
})

test('2347 three of a kind, high card, and a flush beats a triple', () => {
  assert.equal(solve([5, 5, 5, 2, 9], ['a', 'b', 'c', 'd', 'a']), 'Three of a Kind')
  assert.equal(solve([1, 2, 3, 4, 5], ['a', 'b', 'c', 'd', 'a']), 'High Card')
  assert.equal(solve([7, 7, 7, 7, 7], ['b', 'b', 'b', 'b', 'b']), 'Flush')
})

test('2347 rejects a suit outside a to d and a rank outside 1 to 13', () => {
  assert.throws(() => parseInput('{"ranks":[1,2,3,4,5],"suits":["a","b","c","d","e"]}'))
  assert.throws(() => parseInput('{"ranks":[1,2,3,4,14],"suits":["a","b","c","d","a"]}'))
})

// Independent oracle: a flush is five identical suits; otherwise count each card's rank by scanning.
function oracle(ranks, suits) {
  if (suits.every(x => x === suits[0])) return 'Flush'
  const most = Math.max(...ranks.map(r => ranks.filter(x => x === r).length))
  if (most >= 3) return 'Three of a Kind'
  if (most === 2) return 'Pair'
  return 'High Card'
}

test('2347 random hands match a scan-every-card oracle', () => {
  let seed = 2347
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const ranks = Array.from({ length: 5 }, () => 1 + rnd(13))
    const suits = Array.from({ length: 5 }, () => 'abcd'[rnd(4)])
    assert.equal(solve(ranks, suits), oracle(ranks, suits), JSON.stringify({ ranks, suits }))
  }
})
