import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'
import { spawnSync } from 'node:child_process'

const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result

test('47 official examples', () => {
  assert.deepEqual(solve([1, 1, 2]), [[1, 1, 2], [1, 2, 1], [2, 1, 1]])
  assert.deepEqual(solve([1, 2, 3]), [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]])
})

test('47 single value and all-equal values', () => {
  assert.deepEqual(solve([7]), [[7]])
  assert.deepEqual(solve([2, 2]), [[2, 2]])
})

test('47 rejects empty input, large input, and out-of-range values', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[1,2,3,4,5,6,7]'))
  assert.throws(() => parseInput('[11]'))
})

// Independent oracle: generate every ordering of the positions, keep distinct value lists, sort them.
function oracle(nums) {
  const all = []
  const pick = (chosen, rest) => {
    if (rest.length === 0) { all.push(chosen.map(i => nums[i])); return }
    rest.forEach((r, k) => pick([...chosen, r], rest.filter((_, j) => j !== k)))
  }
  pick([], nums.map((_, i) => i))
  const seen = new Map(all.map(p => [JSON.stringify(p), p]))
  return [...seen.values()].sort((a, b) => {
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i]
    return 0
  })
}

test('47 seeded random inputs match an all-orderings oracle', () => {
  let seed = 47
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 1 + rnd(5) }, () => rnd(7) - 3)
    assert.deepEqual(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})

test('47 displayed Python returns the same permutations', () => {
  const cases = [[1, 1, 2], [1, 2, 3], [2, 2], [3, -1, 3, 0]]
  const result = spawnSync(process.env.PYTHON || 'python', ['-c', 'import json,sys\np=json.load(sys.stdin)\nexec(p["source"])\nprint(json.dumps([permute_unique(c) for c in p["cases"]]))'], {
    input: JSON.stringify({ source: python, cases }), encoding: 'utf8',
  })
  assert.equal(result.status, 0, result.stderr || result.error?.message)
  assert.deepEqual(JSON.parse(result.stdout), cases.map(solve))
})
