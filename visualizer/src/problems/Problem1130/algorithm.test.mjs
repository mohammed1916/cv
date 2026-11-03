import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code } from './algorithm.js'

// Independent oracle: interval DP over every ordered split of the leaves.
function oracle(arr) {
  const n = arr.length
  const mx = (i, j) => Math.max(...arr.slice(i, j + 1))
  const dp = Array.from({ length: n }, () => new Array(n).fill(0))
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i + len - 1 < n; i++) {
      const j = i + len - 1
      let best = Infinity
      for (let k = i; k < j; k++) best = Math.min(best, dp[i][k] + dp[k + 1][j] + mx(i, k) * mx(k + 1, j))
      dp[i][j] = best
    }
  }
  return dp[0][n - 1]
}

test('own samples give the expected minimum cost', () => {
  assert.equal(buildTrace([2, 3]).result, 6)
  assert.equal(buildTrace([6, 2, 4]).result, 32)
  assert.equal(buildTrace([4, 11]).result, 44)
  assert.equal(buildTrace([5, 5, 5]).result, 50)
})

test('random leaf lists agree with the interval-DP oracle', () => {
  let state = 77
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 400; t++) {
    const arr = Array.from({ length: 2 + rand(12) }, () => 1 + rand(40))
    assert.equal(buildTrace(arr).result, oracle(arr), JSON.stringify(arr))
  }
})

test('every frame names a declared phase and a real code line', () => {
  const ids = new Set(phases.map(p => p.id))
  const run = buildTrace([6, 2, 4, 1])
  assert.equal(run.frames.at(-1).phase, 'done')
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase), f.phase)
    assert.ok(f.message.length > 5)
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
  }
})

test('invalid input is rejected with a readable message', () => {
  assert.throws(() => parseInput('[5]'), /2 to 30/)
  assert.throws(() => parseInput('[5,0]'), /1 to 40/)
})
