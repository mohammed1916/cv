import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = arr => buildTrace(parseInput(JSON.stringify({ arr }))).result

test('1345 official examples', () => {
  assert.equal(solve([100, -23, -23, 404, 100, 23, 23, 23, 3, 404]), 3)
  assert.equal(solve([7]), 0)
  assert.equal(solve([7, 6, 9, 6, 9, 6, 9, 7]), 1)
})

test('1345 a jump to an equal value shortcuts the walk', () => {
  // Index 0 and index 3 share value 4, so one jump reaches the last index.
  assert.equal(solve([4, 1, 2, 4]), 1)
})

test('1345 rejects a value above 1000', () => {
  assert.throws(() => parseInput('{"arr":[1001,1]}'))
})

// Independent oracle: relaxation over the array until no distance improves, using the three neighbour rules.
function oracle(arr) {
  const n = arr.length
  const dist = Array(n).fill(Infinity)
  dist[0] = 0
  let changed = true
  while (changed) {
    changed = false
    for (let i = 0; i < n; i++) {
      if (dist[i] === Infinity) continue
      for (let j = 0; j < n; j++) {
        const adjacent = j === i - 1 || j === i + 1 || (arr[j] === arr[i] && j !== i)
        if (adjacent && dist[i] + 1 < dist[j]) {
          dist[j] = dist[i] + 1
          changed = true
        }
      }
    }
  }
  return dist[n - 1] === Infinity ? -1 : dist[n - 1]
}

test('1345 random arrays match a relaxation oracle', () => {
  let seed = 1345
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const arr = Array.from({ length: 1 + rnd(12) }, () => rnd(9) - 4)
    assert.equal(solve(arr), oracle(arr), JSON.stringify(arr))
  }
})
