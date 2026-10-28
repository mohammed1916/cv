import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (garbage, travel) => buildTrace(parseInput(JSON.stringify({ garbage, travel }))).result

test('2391 official examples', () => {
  assert.equal(solve(['G', 'P', 'GP', 'GG'], [2, 4, 3]), 21)
  assert.equal(solve(['MMM', 'PGM', 'GP'], [3, 10]), 37)
})

test('2391 a type that never appears costs nothing to collect', () => {
  assert.equal(solve(['G', 'G'], [5]), 2 + 5)
})

test('2391 rejects a travel list of the wrong length', () => {
  assert.throws(() => parseInput('{"garbage":["M","G"],"travel":[]}'))
})

// Independent oracle: simulate each truck walking from house 0 to its last stop, one house at a time.
function oracle(garbage, travel) {
  let total = 0
  for (const g of garbage) total += g.length
  for (const type of ['M', 'P', 'G']) {
    let stop = -1
    for (let i = 0; i < garbage.length; i++) if (garbage[i].includes(type)) stop = i
    for (let i = 0; i < stop; i++) total += travel[i]
  }
  return total
}

test('2391 seeded random inputs match a step-by-step truck oracle', () => {
  let seed = 2391
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const letters = 'MPG'
  for (let t = 0; t < 300; t++) {
    const houses = 2 + rnd(7)
    const garbage = Array.from({ length: houses }, () => Array.from({ length: 1 + rnd(4) }, () => letters[rnd(3)]).join(''))
    const travel = Array.from({ length: houses - 1 }, () => 1 + rnd(5))
    assert.equal(solve(garbage, travel), oracle(garbage, travel), JSON.stringify({ garbage, travel }))
  }
})
