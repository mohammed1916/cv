import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (num1, num2) => buildTrace(parseInput(JSON.stringify({ num1, num2 }))).result

test('3751 official examples', () => {
  assert.equal(solve(120, 130), 3)
  assert.equal(solve(198, 202), 3)
  assert.equal(solve(4848, 4848), 2)
})

test('3751 numbers with fewer than three digits have no waviness', () => {
  assert.equal(solve(10, 99), 0)
})

test('3751 rejects a reversed range', () => {
  assert.throws(() => parseInput('{"num1":5,"num2":4}'))
})

// Independent oracle: a turn is two adjacent nonzero steps in opposite directions.
function oracle(num1, num2) {
  let total = 0
  for (let x = num1; x <= num2; x++) {
    const ds = String(x).split('').map(Number)
    const steps = []
    for (let i = 0; i + 1 < ds.length; i++) steps.push(Math.sign(ds[i + 1] - ds[i]))
    for (let i = 0; i + 1 < steps.length; i++) {
      if (steps[i] !== 0 && steps[i + 1] !== 0 && steps[i] !== steps[i + 1]) total++
    }
  }
  return total
}

let seed = 3751
const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }

test('3751 seeded random against step-sign oracle', () => {
  for (let t = 0; t < 150; t++) {
    const a = 1 + rnd(99999)
    const b = Math.min(100000, a + rnd(200))
    assert.equal(solve(a, b), oracle(a, b), `${a}..${b}`)
  }
})
