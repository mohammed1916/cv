import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, target) => buildTrace({ n, target }).result

test('3752 worked examples', () => {
  assert.deepEqual(solve(3, 0), [-3, 1, 2])
  assert.deepEqual(solve(2, 2), [])
})

// Brute force: enumerate every permutation and every sign pattern, keep the smallest matching array.
function brute(n, target) {
  const perms = []
  const gen = (prefix, rest) => {
    if (!rest.length) { perms.push(prefix); return }
    rest.forEach((v, k) => gen([...prefix, v], rest.filter((_, j) => j !== k)))
  }
  gen([], Array.from({ length: n }, (_, k) => k + 1))
  let best = null
  for (const p of perms) {
    for (let mask = 0; mask < 1 << n; mask++) {
      const arr = p.map((v, k) => ((mask >> k) & 1 ? -v : v))
      if (arr.reduce((a, b) => a + b, 0) !== target) continue
      if (!best || cmp(arr, best) < 0) best = arr
    }
  }
  return best ?? []
}

function cmp(a, b) {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i]
  return 0
}

test('3752 matches exhaustive search for small n and every target in range', () => {
  for (let n = 1; n <= 5; n++) {
    const max = n * (n + 1) / 2
    for (let target = -max; target <= max; target++) {
      assert.deepEqual(solve(n, target), brute(n, target), `n=${n} target=${target}`)
    }
  }
})

test('3752 rejects an out-of-range visualization input', () => {
  assert.throws(() => parseInput('{"n":11,"target":0}'))
  assert.throws(() => parseInput('{"n":3,"target":99}'))
})
