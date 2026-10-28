import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3238 official examples', () => {
  assert.equal(solve({ n: 4, pick: [[0, 0], [1, 0], [1, 0], [2, 1], [2, 1], [2, 0]] }), 2)
  assert.equal(solve({ n: 5, pick: [[1, 1], [1, 2], [1, 3], [1, 4]] }), 0)
  assert.equal(solve({ n: 5, pick: [[1, 1], [2, 4], [2, 4], [2, 4]] }), 1)
})

test('3238 edge case: player 0 wins with a single ball', () => {
  assert.equal(solve({ n: 2, pick: [[0, 3]] }), 1)
  assert.equal(solve({ n: 2, pick: [[1, 3]] }), 0)
})

test('3238 rejects a player outside the range and a color above 10', () => {
  assert.throws(() => parseInput('{"n":2,"pick":[[2,0]]}'))
  assert.throws(() => parseInput('{"n":2,"pick":[[0,11]]}'))
})

// Independent oracle: for each player separately, filter their picks and check every color's count.
function oracle({ n, pick }) {
  let winners = 0
  for (let player = 0; player < n; player++) {
    const mine = pick.filter(([p]) => p === player)
    const colors = [...new Set(mine.map(([, c]) => c))]
    const wins = colors.some(c => mine.filter(([, col]) => col === c).length > player)
    if (wins) winners += 1
  }
  return winners
}

test('3238 random picks match a per-player oracle', () => {
  let seed = 3238
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(5)
    const input = { n, pick: Array.from({ length: 1 + rnd(15) }, () => [rnd(n), rnd(4)]) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
