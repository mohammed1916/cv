import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2442 official examples', () => {
  assert.equal(solve('{"nums":[1,13,10,12,31]}'), 6)
  assert.equal(solve('{"nums":[2,2,2]}'), 1)
})

test('2442 trailing zeros disappear when reversed', () => {
  // 10 reversed is 1, which is already counted from the number 1.
  assert.equal(solve('{"nums":[1,10]}'), 2)
})

test('2442 rejects zero', () => {
  assert.throws(() => parseInput('{"nums":[0]}'))
})

// Independent oracle: reverse with arithmetic (remainder and quotient), not with strings.
function oracle(nums) {
  const all = new Set()
  for (const x of nums) {
    all.add(x)
    let rev = 0
    for (let rest = x; rest > 0; rest = Math.floor(rest / 10)) rev = rev * 10 + (rest % 10)
    all.add(rev)
  }
  return all.size
}

test('2442 random numbers match an arithmetic-reversal oracle', () => {
  let seed = 2442
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let round = 0; round < 300; round++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(999))
    assert.equal(solve(JSON.stringify({ nums })), oracle(nums), JSON.stringify(nums))
  }
})
