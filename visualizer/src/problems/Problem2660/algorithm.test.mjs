import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2660 worked examples', () => {
  assert.equal(solve('{"player1":[4,10,7,9],"player2":[6,5,2,3]}'), 1)
  assert.equal(solve('{"player1":[1,2],"player2":[1,2]}'), 0)
})

test('2660 rejects a pin count above 10', () => {
  assert.throws(() => parseInput('{"player1":[11],"player2":[1]}'))
})

// Independent oracle: look back over the previous two turns as a slice and double when a ten appears there.
function oracle({ player1, player2 }) {
  const score = arr => arr.reduce((sum, pins, i) => {
    const recent = arr.slice(Math.max(0, i - 2), i)
    return sum + (recent.includes(10) ? 2 * pins : pins)
  }, 0)
  const a = score(player1)
  const b = score(player2)
  return a > b ? 1 : b > a ? 2 : 0
}

test('2660 seeded random games match the slice oracle', () => {
  let seed = 2660
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(10)
    const input = {
      player1: Array.from({ length: len }, () => rnd(11)),
      player2: Array.from({ length: len }, () => rnd(11)),
    }
    assert.equal(solve(JSON.stringify(input)), oracle(input), JSON.stringify(input))
  }
})
