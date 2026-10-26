import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('659 official examples', () => {
  assert.equal(buildTrace([1, 2, 3, 3, 4, 5]).result, true)
  assert.equal(buildTrace([1, 2, 3, 3, 4, 4, 5, 5]).result, true)
  assert.equal(buildTrace([1, 2, 3, 4, 4, 5]).result, false)
})

// Oracle: try every assignment of elements to groups (restricted growth strings), then check each group.
test('659 small sorted arrays match exhaustive grouping', () => {
  let state = 4
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rand(7) }, () => 1 + rand(4)).sort((a, b) => a - b)
    const n = nums.length
    let feasible = false
    const groups = []
    function assign(i) {
      if (feasible) return
      if (i === n) {
        feasible = groups.every(g => g.length >= 3 && g.every((v, j) => j === 0 || v === g[j - 1] + 1))
        return
      }
      for (let gi = 0; gi <= groups.length; gi++) {
        if (gi === groups.length) groups.push([])
        groups[gi].push(nums[i])
        assign(i + 1)
        groups[gi].pop()
        if (groups[gi].length === 0) groups.pop()
        if (feasible) return
      }
    }
    assign(0)
    assert.equal(buildTrace(nums).result, feasible, JSON.stringify(nums))
  }
})

test('659 rejects unsorted input', () => {
  assert.throws(() => parseInput('[2,1]'))
})
