import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('3818 worked examples', () => {
  assert.equal(solve([1, 3, 2, 4]), 2)
  assert.equal(solve([1, 2, 3]), 0)
  assert.equal(solve([5, 4, 3]), 2)
})

test('3818 edge cases', () => {
  assert.equal(solve([7]), 0)
  assert.equal(solve([2, 2]), 1)
  assert.equal(solve([-5, 1, 0]), 2)
})

test('3818 already increasing: no violation, result 0', () => {
  const trace = buildTrace({ nums: [1, 2, 3, 4] })
  assert.equal(trace.result, 0)
  assert.ok(trace.frames.every(f => f.verdict !== 'violation'))
  assert.equal(trace.frames.at(-1).k, 0)
})

test('3818 descending: stops at the first violation from the right', () => {
  const trace = buildTrace({ nums: [5, 4, 3] })
  assert.equal(trace.result, 2)
  const violations = trace.frames.filter(f => f.verdict === 'violation')
  assert.equal(violations.length, 1)
  assert.deepEqual([violations[0].leftValue, violations[0].rightValue], [4, 3])
})

test('3818 equality at the boundary counts as a violation (strict increase)', () => {
  const trace = buildTrace({ nums: [1, 2, 2, 3] })
  assert.equal(trace.result, 2)
  const violation = trace.frames.find(f => f.verdict === 'violation')
  assert.deepEqual([violation.left, violation.right, violation.leftValue, violation.rightValue], [1, 2, 2, 2])
})

test('3818 one-element array has no comparisons and result 0', () => {
  const trace = buildTrace({ nums: [7] })
  assert.equal(trace.result, 0)
  assert.ok(trace.frames.every(f => f.verdict === ''))
  assert.equal(trace.frames.at(-1).phase, 'done')
})

test('3818 rejects malformed input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[1.5]'))
  assert.throws(() => parseInput('{"nums":[1]}'))
})

// Independent oracle: the smallest k whose suffix is strictly increasing, found by checking each k.
function oracle(nums) {
  for (let k = 0; k < nums.length; k++) {
    let ok = true
    for (let j = k; j + 1 < nums.length; j++) if (!(nums[j] < nums[j + 1])) { ok = false; break }
    if (ok) return k
  }
  return nums.length
}

test('3818 random inputs match a brute-force oracle', () => {
  let seed = 3818
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 500; t++) {
    const nums = Array.from({ length: 1 + rnd(9) }, () => rnd(7) - 3)
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})

test('3818 frames keep provisional state, valid line references and a final done frame', () => {
  const codeLines = code.length
  const pyLines = python.trim().split('\n').length
  for (const nums of [[4, 1, 2, 3], [1, 3, 2, 4], [7], [2, 2], [1, 2, 3]]) {
    const trace = buildTrace({ nums })
    assert.equal(trace.frames.at(-1).phase, 'done')
    assert.equal(trace.frames.at(-1).k, trace.result)
    assert.ok(trace.frames.slice(0, -1).every(f => f.phase !== 'done'))
    for (const f of trace.frames) {
      assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= codeLines)
      assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines)
      assert.ok(f.k >= 0 && f.k < nums.length)
    }
  }
})
