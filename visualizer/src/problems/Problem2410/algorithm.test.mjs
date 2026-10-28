import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('2410 official examples', () => {
  assert.equal(solve({ players: [4, 7, 9], trainers: [8, 2, 3, 1] }), 1)
  assert.equal(solve({ players: [1, 1, 1], trainers: [10] }), 1)
})

test('2410 equal ability is enough to train a player', () => {
  assert.equal(solve({ players: [3, 3], trainers: [3, 3] }), 2)
})

test('2410 rejects an empty trainer list', () => {
  assert.throws(() => parseInput('{"players":[1],"trainers":[]}'))
})

// Independent oracle: for each player in turn, either leave them unmatched or match them to any free trainer at least as strong.
function oracle({ players, trainers }) {
  const used = Array(trainers.length).fill(false)
  const walk = i => {
    if (i === players.length) return 0
    let best = walk(i + 1)
    for (let j = 0; j < trainers.length; j++) {
      if (used[j] || players[i] > trainers[j]) continue
      used[j] = true
      best = Math.max(best, 1 + walk(i + 1))
      used[j] = false
    }
    return best
  }
  return walk(0)
}

test('2410 random rosters match a matching enumeration oracle', () => {
  let seed = 2410
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const input = {
      players: Array.from({ length: 1 + rnd(6) }, () => 1 + rnd(10)),
      trainers: Array.from({ length: 1 + rnd(6) }, () => 1 + rnd(10)),
    }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
