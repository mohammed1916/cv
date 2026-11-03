import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (d, r) => buildTrace({ d, r }).result

test('3733 hand-checked cases', () => {
  assert.equal(solve([2, 2], [2, 2]), 7)
  assert.equal(solve([3, 1], [2, 3]), 5)
  assert.equal(solve([1, 1], [2, 3]), 2)
})

// Independent oracle: try every hour assignment (drone 1, drone 2 or idle) for growing time limits.
function brute(d, r) {
  for (let T = 1; T <= 40; T++) {
    const search = (hour, left1, left2) => {
      if (left1 === 0 && left2 === 0) return true
      if (hour > T) return false
      const can1 = left1 > 0 && hour % r[0] !== 0
      const can2 = left2 > 0 && hour % r[1] !== 0
      if (can1 && search(hour + 1, left1 - 1, left2)) return true
      if (can2 && search(hour + 1, left1, left2 - 1)) return true
      return search(hour + 1, left1, left2)
    }
    if (search(1, d[0], d[1])) return T
  }
  return -1
}

test('3733 matches the brute-force schedule search on small inputs', () => {
  for (let d1 = 1; d1 <= 5; d1++) for (let d2 = 1; d2 <= 5; d2++) for (let r1 = 2; r1 <= 4; r1++) for (let r2 = 2; r2 <= 4; r2++) {
    assert.equal(solve([d1, d2], [r1, r2]), brute([d1, d2], [r1, r2]), `d=[${d1},${d2}] r=[${r1},${r2}]`)
  }
})

test('3733 rejects a recharge period below two', () => {
  assert.throws(() => parseInput('{"d":[1,1],"r":[1,3]}'))
})
