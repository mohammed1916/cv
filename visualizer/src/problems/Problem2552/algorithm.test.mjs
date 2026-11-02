import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

function runPython(call) {
  const r = spawnSync('python3', ['-I', '-c', `${python}\nprint(${call})`], { encoding: 'utf8' })
  assert.equal(r.status, 0, r.stderr)
  return r.stdout.trim()
}

function shuffled(n, rnd) {
  const a = Array.from({ length: n }, (_, i) => i + 1)
  for (let i = n - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]] }
  return a
}

test('2552 worked examples', () => {
  assert.equal(solve([1, 3, 2, 4, 5]), 2)
  assert.equal(solve([1, 2, 3, 4]), 0)
  assert.equal(solve([4, 3, 2, 1, 5, 6]), 0)
})

test('2552 every frame points at an executable python line', () => {
  const lines = python.split('\n')
  for (const frame of buildTrace(parseInput('{"nums": [1, 3, 2, 4, 5]}')).frames) {
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= lines.length)
    assert.ok(lines[frame.pythonLine - 1].trim().length > 0)
  }
})

test('2552 python export agrees with the trace', () => {
  for (const nums of [[1, 3, 2, 4, 5], [1, 2, 3, 4], [2, 1, 4, 3, 6, 5]]) {
    assert.equal(runPython(`countIncreasingQuadruplets([${nums.join(', ')}])`), String(solve(nums)))
  }
})

test('2552 random permutations match a four-index brute force', () => {
  let seed = 2552
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % k }
  for (let t = 0; t < 200; t++) {
    const n = 4 + rnd(6)
    const nums = shuffled(n, rnd)
    let expected = 0
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (let k = j + 1; k < n; k++) for (let l = k + 1; l < n; l++) {
      if (nums[i] < nums[k] && nums[k] < nums[j] && nums[j] < nums[l]) expected++
    }
    assert.equal(solve(nums), expected, JSON.stringify(nums))
  }
})

test('2552 rejects values that are not a permutation', () => {
  assert.throws(() => parseInput('{"nums": [1, 1, 2, 3]}'))
  assert.throws(() => parseInput('{"nums": [1, 2, 3]}'))
})
