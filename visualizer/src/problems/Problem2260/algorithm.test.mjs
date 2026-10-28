import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2260 official examples', () => {
  assert.equal(solve('{"cards":[3,4,2,3,4,7]}'), 4)
  assert.equal(solve('{"cards":[1,0,5,3]}'), -1)
})

test('2260 two equal neighbours give a run of two', () => {
  assert.equal(solve('{"cards":[9,9]}'), 2)
})

test('2260 rejects an empty card list', () => {
  assert.throws(() => parseInput('{"cards":[]}'))
})

// Independent oracle: compare every pair of positions directly.
function oracle(cards) {
  let best = -1
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      if (cards[i] === cards[j]) {
        const length = j - i + 1
        if (best === -1 || length < best) best = length
      }
    }
  }
  return best
}

test('2260 random cards match an all-pairs oracle', () => {
  let seed = 2260
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let round = 0; round < 300; round++) {
    const cards = Array.from({ length: 1 + rnd(12) }, () => rnd(7))
    assert.equal(solve(JSON.stringify({ cards })), oracle(cards), JSON.stringify(cards))
  }
})
