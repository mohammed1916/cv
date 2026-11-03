import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code } from './algorithm.js'

const solve = (s, k) => buildTrace({ s, k }).result

// Independent oracle: the fewest deletions equal length minus the longest palindromic subsequence.
function longestPalindromeLength(s) {
  const n = s.length
  const best = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)))
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i + len <= n; i++) {
      const j = i + len - 1
      if (s[i] === s[j]) best[i][j] = (len === 2 ? 0 : best[i + 1][j - 1]) + 2
      else best[i][j] = Math.max(best[i + 1][j], best[i][j - 1])
    }
  }
  return best[0][n - 1]
}

test('worked examples', () => {
  assert.equal(solve('abcabca', 2), true)
  assert.equal(solve('abcabca', 1), false)
  assert.equal(solve('racecar', 0), true)
  assert.equal(solve('parrot', 3), false)
  assert.equal(solve('parrot', 4), true)
})

test('random strings agree with the longest-palindromic-subsequence oracle', () => {
  let state = 3
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const s = Array.from({ length: 1 + rand(12) }, () => 'abcd'[rand(4)]).join('')
    const k = rand(13)
    assert.equal(solve(s, k), s.length - longestPalindromeLength(s) <= k, `${s} ${k}`)
  }
})

test('parser rejects long strings and out-of-range k', () => {
  assert.throws(() => parseInput('{"s":"abcdefghijklm","k":1}'), /1 to 12/)
  assert.throws(() => parseInput('{"s":"ab","k":-1}'), /0 to 12/)
  assert.deepEqual(parseInput('{"s":"ab","k":0}'), { s: 'ab', k: 0 })
})

test('every frame has a known phase, narration and a line inside the solver', () => {
  const ids = new Set(phases.map(p => p.id))
  const run = buildTrace({ s: 'abcabca', k: 2 })
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.message.length > 10)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
