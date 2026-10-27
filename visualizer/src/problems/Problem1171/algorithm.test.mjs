import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = head => buildTrace(parseInput(JSON.stringify({ head }))).result

test('1171 official examples', () => {
  assert.deepEqual(solve([1, 2, -3, 3, 1]), [3, 1])
  assert.deepEqual(solve([1, 2, 3, -3, 4]), [1, 2, 4])
  assert.deepEqual(solve([1, 2, 3, -3, -2]), [1])
})

test('1171 the whole list can vanish', () => {
  assert.deepEqual(solve([1, -1]), [])
})

test('1171 rejects a non-integer value', () => {
  assert.throws(() => parseInput('{"head":[1.5]}'))
})

// Independent oracle: repeatedly delete the first zero-sum run of consecutive nodes until none is left.
function oracle(head) {
  let list = [...head]
  let changed = true
  while (changed) {
    changed = false
    outer: for (let i = 0; i < list.length; i++) {
      let sum = 0
      for (let j = i; j < list.length; j++) {
        sum += list[j]
        if (sum === 0) {
          list = [...list.slice(0, i), ...list.slice(j + 1)]
          changed = true
          break outer
        }
      }
    }
  }
  return list
}

test('1171 random lists match a repeated-deletion oracle', () => {
  let seed = 1171
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const head = Array.from({ length: 1 + rnd(10) }, () => rnd(7) - 3)
    assert.deepEqual(solve(head), oracle(head), JSON.stringify(head))
  }
})
