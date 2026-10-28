import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (num1, num2) => buildTrace(parseInput(JSON.stringify({ num1, num2 }))).result

test('3753 official examples', () => {
  assert.equal(solve(120, 130), 3)
  assert.equal(solve(198, 202), 3)
  assert.equal(solve(4848, 4848), 2)
})

test('3753 a range starting at 1 uses the zero prefix', () => {
  assert.equal(solve(1, 1), 0)
  assert.equal(solve(1, 1000), solve(1, 999) + 0)
})

test('3753 rejects a reversed range', () => {
  assert.throws(() => parseInput('{"num1":9,"num2":3}'))
})

// Independent oracle: count adjacent opposite nonzero steps in each number, directly.
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

let seed = 3753
const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }

test('3753 seeded random against step-sign oracle', () => {
  for (let t = 0; t < 150; t++) {
    const a = 1 + rnd(20000)
    const b = a + rnd(400)
    assert.equal(solve(a, b), oracle(a, b), `${a}..${b}`)
  }
})

test('3753 wide ranges agree with the oracle', () => {
  assert.equal(solve(1, 30000), oracle(1, 30000))
  assert.equal(solve(99000, 100500), oracle(99000, 100500))
})
