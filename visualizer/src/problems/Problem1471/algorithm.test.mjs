import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const solve = (arr, k) => buildTrace({ arr, k }).result

test('1471 sample inputs pick the expected strongest values', () => {
  assert.deepEqual(solve([1, 2, 3, 4, 5], 2), [5, 1])
  assert.deepEqual(solve([-7, 4, 4, 10, 0], 3), [-7, 10, 0])
  assert.deepEqual(solve([1, 2, 3, 4], 2), [4, 3])
})

// Oracle: a value is in the answer when fewer than k values are strictly stronger.
// Ties of equal strength and value are broken by index so duplicates are counted once each.
function oracle(arr, k) {
  const n = arr.length
  const m = [...arr].sort((a, b) => a - b)[Math.floor((n - 1) / 2)]
  const beats = (j, i) => {
    const dj = Math.abs(arr[j] - m)
    const di = Math.abs(arr[i] - m)
    if (dj !== di) return dj > di
    if (arr[j] !== arr[i]) return arr[j] > arr[i]
    return j < i
  }
  const chosen = []
  for (let i = 0; i < n; i++) {
    let stronger = 0
    for (let j = 0; j < n; j++) if (j !== i && beats(j, i)) stronger++
    if (stronger < k) chosen.push(arr[i])
  }
  return chosen
}

test('1471 random inputs match a counting oracle', () => {
  let seed = 9
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(12)
    const arr = Array.from({ length: n }, () => rnd(41) - 20)
    const k = 1 + rnd(n)
    const got = solve(arr, k)
    assert.equal(got.length, k, JSON.stringify({ arr, k }))
    assert.deepEqual([...got].sort((a, b) => a - b), oracle(arr, k).sort((a, b) => a - b), JSON.stringify({ arr, k }))
  }
})

test('1471 rejects malformed input', () => {
  assert.throws(() => parseInput('{"arr":[1,2],"k":3}'), /1 to the length/)
  assert.throws(() => parseInput('{"arr":[1,2000],"k":1}'), /-1000 to 1000/)
  assert.throws(() => parseInput('[1,2]'), /object/)
})

test('1471 every frame points at a real phase and code line', () => {
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.split('\n').length
  for (const frame of buildTrace({ arr: [3, -1, 8, 2], k: 2 }).frames) {
    assert.ok(ids.has(frame.phase), frame.phase)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
  }
})
