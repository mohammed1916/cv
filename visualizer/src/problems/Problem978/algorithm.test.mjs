import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: test every subarray for the alternating rule.
function isTurbulent(arr, i, j) {
  for (let k = i; k < j; k++) {
    const rising = arr[k] < arr[k + 1]
    const falling = arr[k] > arr[k + 1]
    if (!rising && !falling) return false
    if (k + 1 < j) {
      const nextRising = arr[k + 1] < arr[k + 2]
      if (rising === nextRising) return false
    }
  }
  return true
}

function bruteLongest(arr) {
  let best = 1
  for (let i = 0; i < arr.length; i++) {
    for (let j = i; j < arr.length; j++) {
      if (isTurbulent(arr, i, j)) best = Math.max(best, j - i + 1)
    }
  }
  return best
}

test('978 longest turbulent subarray matches the brute-force oracle', () => {
  const samples = [
    [5], [3, 3, 3], [1, 2, 3, 4], [4, 1, 3, 2, 5], [9, 4, 2, 10, 7, 8, 8, 1, 9],
    [2, 2, 5, 1, 4, 0, 6, 6], [10, 3, 8, 1, 1, 9, 2], [0, 5, 0, 5, 0, 5, 9, 9],
  ]
  for (const arr of samples) {
    assert.equal(buildTrace(parseInput(JSON.stringify({ arr }))).result, bruteLongest(arr), JSON.stringify(arr))
  }
})
