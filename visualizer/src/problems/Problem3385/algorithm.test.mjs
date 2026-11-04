import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const solve = strength => buildTrace({ strength }).result

// Oracle: DP over subsets of locks already broken; the subset size gives the next X.
function oracle(strength) {
  const n = strength.length
  const dp = Array(1 << n).fill(Infinity)
  dp[0] = 0
  for (let mask = 0; mask < 1 << n; mask++) {
    let x = 1
    for (let b = 0; b < n; b++) if (mask >> b & 1) x++
    for (let b = 0; b < n; b++) {
      if (mask >> b & 1) continue
      const next = mask | 1 << b
      dp[next] = Math.min(dp[next], dp[mask] + Math.ceil(strength[b] / x))
    }
  }
  return dp[(1 << n) - 1]
}

test('3385 hand-computed cases', () => {
  assert.equal(solve([7]), 7)
  assert.equal(solve([1, 1]), 2) // 1 at X=1, then 1 at X=2
  assert.equal(solve([1, 10]), 6) // 1 at X=1, 10 at X=2 costs 1+5
  assert.equal(solve([10, 1]), 6)
  assert.equal(solve([3, 7, 2, 4, 5]), 8) // 2, 4, 3, 7, 5 costs 2+2+1+2+1
})

test('3385 sorting by strength is not always optimal', () => {
  const { result, sortedTotal } = buildTrace({ strength: [3, 7, 2, 4, 5] })
  assert.equal(result, 8)
  assert.equal(sortedTotal, 10)
})

test('3385 random inputs match a subset DP oracle', () => {
  let seed = 3385
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const n = 1 + rnd(8)
    const top = [5, 30, 1000, 1000000][rnd(4)]
    const strength = Array.from({ length: n }, () => 1 + rnd(top))
    assert.equal(solve(strength), oracle(strength), JSON.stringify(strength))
  }
})

test('3385 the assignment is a permutation and its minutes add up', () => {
  const strength = [8, 25, 5, 4, 9, 18]
  const { assignment, result } = buildTrace({ strength })
  assert.deepEqual(assignment.map(a => a.lock).sort((a, b) => a - b), [1, 2, 3, 4, 5, 6])
  assert.equal(assignment.reduce((sum, a) => sum + Math.ceil(strength[a.lock - 1] / a.slot), 0), result)
})

test('3385 final prices certify optimality and assigned cells stay tight', () => {
  const strength = [8, 25, 5, 4, 9, 18]
  const { frames, cost, result } = buildTrace({ strength })
  const last = frames.at(-1)
  const sum = list => list.reduce((a, b) => a + b, 0)
  assert.equal(sum(last.u.slice(1)) + sum(last.v.slice(1)), result) // index 0 is the search's virtual slot
  for (const frame of frames) {
    for (let j = 1; j <= strength.length; j++) {
      const i = frame.match[j]
      if (i && frame.phase !== 'augment') assert.equal(cost[i - 1][j - 1] - frame.u[i] - frame.v[j], 0)
    }
  }
  for (let i = 1; i <= strength.length; i++) for (let j = 1; j <= strength.length; j++) assert.ok(cost[i - 1][j - 1] - last.u[i] - last.v[j] >= 0)
})

test('3385 parse enforces the rules', () => {
  assert.doesNotThrow(() => parseInput('{"strength":[1000000]}'))
  assert.throws(() => parseInput('{"strength":[]}'))
  assert.throws(() => parseInput('{"strength":[0]}'))
  assert.throws(() => parseInput('{"strength":[1000001]}'))
  assert.throws(() => parseInput('{"strength":[1,2,3,4,5,6,7,8,9]}'))
})

test('3385 frames are well formed and stay small at the cap', () => {
  const lines = python.split('\n')
  const ids = new Set(phases.map(p => p.id))
  const { frames } = buildTrace({ strength: [80, 3, 44, 9, 27, 61, 5, 12] })
  assert.ok(frames.length < 1500)
  for (const frame of frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(code.some(c => c.line === frame.activeLine))
    assert.ok(lines[frame.pythonLine - 1].trim())
    assert.ok(frame.message.length > 0)
  }
  assert.equal(frames.at(-1).phase, 'done')
})
