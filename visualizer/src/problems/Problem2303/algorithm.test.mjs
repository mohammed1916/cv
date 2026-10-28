import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} is not ${expected}`)

test('2303 official examples', () => {
  near(solve({ brackets: [[3, 50], [7, 10], [12, 25]], income: 10 }), 2.65)
  near(solve({ brackets: [[1, 0], [4, 25], [5, 50]], income: 2 }), 0.25)
  near(solve({ brackets: [[2, 50]], income: 0 }), 0)
})

test('2303 rejects brackets whose upper bounds do not increase', () => {
  assert.throws(() => parseInput('{"brackets":[[3,50],[2,10]],"income":1}'), /strictly increasing/)
})

// Independent oracle: charge each unit of income at the rate of the first bracket that reaches it.
function oracle({ brackets, income }) {
  let total = 0
  for (let unit = 1; unit <= income; unit++) total += brackets.find(([upper]) => unit <= upper)[1] / 100
  return total
}

test('2303 random brackets match a unit-by-unit oracle', () => {
  let seed = 2303
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const count = 1 + rnd(4)
    const brackets = []
    let upper = 0
    for (let k = 0; k < count; k++) { upper += 1 + rnd(5); brackets.push([upper, rnd(101)]) }
    const income = rnd(upper + 1)
    near(solve({ brackets, income }), oracle({ brackets, income }))
  }
})
