import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2441 official examples', () => {
  assert.equal(solve('{"nums":[-1,2,-3,3]}'), 3)
  assert.equal(solve('{"nums":[-1,10,6,7,-7,1]}'), 7)
  assert.equal(solve('{"nums":[-10,8,6,7,-2,-3]}'), -1)
})

test('2441 a positive number without its negative does not count', () => {
  assert.equal(solve('{"nums":[5,-4,4]}'), 4)
})

test('2441 rejects zero', () => {
  assert.throws(() => parseInput('{"nums":[0,1]}'))
})

// Independent oracle: compare every ordered pair directly.
function oracle(nums) {
  let best = -1
  for (const a of nums) {
    for (const b of nums) {
      if (a > 0 && a === -b) best = Math.max(best, a)
    }
  }
  return best
}

test('2441 random distinct numbers match an all-pairs oracle', () => {
  let seed = 2441
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const pool = []
  for (let v = -9; v <= 9; v++) if (v !== 0) pool.push(v)
  for (let round = 0; round < 300; round++) {
    const copy = [...pool]
    const nums = []
    for (let i = 0, count = 1 + rnd(12); i < count; i++) nums.push(copy.splice(rnd(copy.length), 1)[0])
    assert.equal(solve(JSON.stringify({ nums })), oracle(nums), JSON.stringify(nums))
  }
})
