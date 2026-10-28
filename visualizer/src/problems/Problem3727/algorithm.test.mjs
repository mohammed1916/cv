import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('3727 official examples', () => {
  assert.equal(solve([1, 2, 3]), 12)
  assert.equal(solve([1, -1, 2, -2, 3, -3]), 16)
})

test('3727 a single value is its square', () => {
  assert.equal(solve([-5]), 25)
})

test('3727 rejects a value that is too large', () => {
  assert.throws(() => parseInput('{"nums":[40001]}'))
})

// Independent oracle: try every ordering of the values and keep the best alternating sum.
function oracle(nums) {
  let best = -Infinity
  const walk = (rest, index, score) => {
    if (!rest.length) { best = Math.max(best, score); return }
    rest.forEach((x, i) => {
      const sign = index % 2 === 0 ? 1 : -1
      walk(rest.slice(0, i).concat(rest.slice(i + 1)), index + 1, score + sign * x * x)
    })
  }
  walk(nums, 0, 0)
  return best
}

let seed = 3727
const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }

test('3727 seeded random against ordering oracle', () => {
  for (let t = 0; t < 150; t++) {
    const nums = Array.from({ length: 1 + rnd(6) }, () => rnd(19) - 9)
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
