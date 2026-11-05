import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result
const PY = python.split('\n')
const PYTHON = process.env.PYTHON || 'python3'
const runPy = (nums, k) => Number(execFileSync(PYTHON, ['-I', '-c', `${python}\nprint(maximum_product([${nums.join(',')}], ${k}))`]).toString().trim())

test('2233 worked examples', () => {
  assert.equal(solve([5, 1, 4], 3), brute([5, 1, 4], 3))
  assert.equal(solve([2, 7], 4), brute([2, 7], 4))
  assert.equal(solve([1], 0), 1)
})

test('2233 frames point at real python lines', () => {
  for (const f of buildTrace({ nums: [1, 2], k: 2 }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2233 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[],"k":1}'))
  assert.throws(() => parseInput('{"nums":[1],"k":21}'))
})

function brute(nums, k) {
  let best = 0n
  const rec = (i, left, arr) => {
    if (i === arr.length - 1) {
      arr[i] += left
      let p = 1n
      for (const x of arr) p *= BigInt(x)
      if (p > best) best = p
      arr[i] -= left
      return
    }
    for (let t = 0; t <= left; t++) {
      arr[i] += t
      rec(i + 1, left - t, arr)
      arr[i] -= t
    }
  }
  rec(0, k, [...nums])
  return Number(best % 1000000007n)
}

test('2233 matches a brute force over every split of the increments', () => {
  let seed = 2233
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const nums = Array.from({ length: 1 + rnd(3) }, () => rnd(6))
    const k = rnd(6)
    assert.equal(solve(nums, k), brute(nums, k), JSON.stringify({ nums, k }))
    if (t < 8) assert.equal(runPy(nums, k), brute(nums, k), JSON.stringify({ nums, k }))
  }
})
