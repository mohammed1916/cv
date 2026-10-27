import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2739 official examples', () => {
  assert.equal(solve('{"mainTank":5,"additionalTank":10}'), 60)
  assert.equal(solve('{"mainTank":1,"additionalTank":2}'), 10)
})

test('2739 rejects a negative main tank', () => {
  assert.throws(() => parseInput('{"mainTank":0,"additionalTank":2}'))
})

// Independent oracle: burn one liter at a time and refill after every fifth liter while the auxiliary tank has fuel.
function oracle({ mainTank, additionalTank }) {
  let main = mainTank
  let extra = additionalTank
  let distance = 0
  let used = 0
  while (main > 0) {
    main -= 1
    distance += 10
    used += 1
    if (used % 5 === 0 && extra > 0) {
      extra -= 1
      main += 1
    }
  }
  return distance
}

test('2739 seeded random cases match a liter-by-liter oracle', () => {
  let seed = 2739
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const input = { mainTank: 1 + rnd(60), additionalTank: rnd(60) }
    assert.equal(solve(JSON.stringify(input)), oracle(input), JSON.stringify(input))
  }
})
