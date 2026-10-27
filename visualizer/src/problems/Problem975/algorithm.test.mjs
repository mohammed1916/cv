import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = arr => buildTrace(arr).result

test('975 official examples', () => {
  assert.equal(solve([10, 13, 12, 14, 15]), 2)
  assert.equal(solve([2, 3, 1, 1, 4]), 3)
  assert.equal(solve([5, 1, 3, 4, 2]), 3)
})

test('975 rejects non-integers', () => {
  assert.throws(() => parseInput('[1.5]'))
})

// Independent oracle: simulate every start as a walk on states (index, number of jumps so far mod 2).
function oracle(arr) {
  const n = arr.length
  let count = 0
  for (let start = 0; start < n; start++) {
    const seen = new Set([`${start},0`])
    const queue = [[start, 0]]
    let reached = start === n - 1
    while (queue.length && !reached) {
      const [i, parity] = queue.shift()
      const odd = parity === 0
      // Brute force the target: scan every later index for the right value.
      let target = -1
      for (let j = i + 1; j < n; j++) {
        const fits = odd ? arr[j] >= arr[i] : arr[j] <= arr[i]
        if (!fits) continue
        if (target === -1) target = j
        else if (odd ? arr[j] < arr[target] || (arr[j] === arr[target] && j < target) : arr[j] > arr[target] || (arr[j] === arr[target] && j < target)) target = j
      }
      if (target === -1) continue
      if (target === n - 1) { reached = true; break }
      const state = `${target},${1 - parity}`
      if (!seen.has(state)) {
        seen.add(state)
        queue.push([target, 1 - parity])
      }
    }
    if (reached) count++
  }
  return count
}

test('975 random arrays match a state-space simulation', () => {
  let seed = 89
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const arr = Array.from({ length: 1 + rnd(12) }, () => rnd(10))
    assert.equal(solve(arr), oracle(arr), JSON.stringify(arr))
  }
})
