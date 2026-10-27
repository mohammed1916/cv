import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3490 examples', () => {
  assert.equal(solve({ l: 1, r: 15 }), 10)
  assert.equal(solve({ l: 10, r: 20 }), 2)
})

test('3490 rejects a reversed range', () => {
  assert.throws(() => parseInput('{"l":9,"r":3}'))
})

// Independent oracle: test every number in the range directly.
function oracle({ l, r }) {
  let count = 0
  for (let x = l; x <= r; x++) {
    const digits = String(x).split('').map(Number)
    const sum = digits.reduce((a, b) => a + b, 0)
    const product = digits.reduce((a, b) => a * b, 1)
    if (product % sum === 0) count++
  }
  return count
}

test('3490 random ranges match a direct scan', () => {
  let seed = 3490
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const l = 1 + rnd(9000)
    const r = l + rnd(10000 - l + 1)
    assert.equal(solve({ l, r }), oracle({ l, r }), `${l}..${r}`)
  }
})
