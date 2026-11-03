import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, code, cycleScore, parseInput, python } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('3149 reference cases', () => {
  assert.deepEqual(solve([1, 0, 2]), [0, 1, 2])
  assert.deepEqual(solve([0, 2, 1]), [0, 2, 1])
})

test('3149 the score uses nums at the next permutation entry, including the closing edge', () => {
  assert.equal(cycleScore([1, 0, 2], [0, 1, 2]), 2)
  assert.equal(buildTrace({ nums: [1, 0, 2] }).score, 2)
})

test('3149 two elements', () => {
  assert.deepEqual(solve([1, 0]), [0, 1])
  assert.deepEqual(solve([0, 1]), [0, 1])
})

test('3149 rejects inputs that are not a permutation of 0 to n-1', () => {
  assert.throws(() => parseInput('{"nums":[1,1,2]}'))
  assert.throws(() => parseInput('{"nums":[0]}'))
  assert.throws(() => parseInput('{"nums":[0,2]}'))
})

// Independent oracle: enumerate every permutation, keep the lowest score, then the lexicographically smallest.
function permutations(items) {
  if (items.length <= 1) return [items]
  const out = []
  items.forEach((x, i) => {
    for (const rest of permutations([...items.slice(0, i), ...items.slice(i + 1)])) out.push([x, ...rest])
  })
  return out
}

function oracle(nums) {
  let best = null
  let bestPerm = null
  for (const perm of permutations([...nums.keys()])) {
    const score = cycleScore(nums, perm)
    const lexLess = (a, b) => { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] < b[i]; return false }
    if (best === null || score < best || (score === best && lexLess(perm, bestPerm))) {
      best = score
      bestPerm = perm
    }
  }
  return bestPerm
}

test('3149 every small permutation matches the brute-force oracle', () => {
  let seed = 3149
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 120; t++) {
    const n = 2 + rnd(5)
    const nums = [...Array(n).keys()]
    for (let i = n - 1; i > 0; i--) {
      const j = rnd(i + 1)
      ;[nums[i], nums[j]] = [nums[j], nums[i]]
    }
    assert.deepEqual(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})

test('3149 frames keep valid line references and the returned score matches', () => {
  const run = buildTrace({ nums: [2, 0, 3, 1] })
  const pyLines = python.split('\n').length
  for (const f of run.frames) {
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length, f.phase)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLines, f.phase)
  }
  assert.equal(cycleScore([2, 0, 3, 1], run.result), run.score)
  assert.equal(run.frames.at(-1).phase, 'done')
})
