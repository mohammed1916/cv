import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Oracle: try every subset. A team is valid unless a younger member scores strictly more than an older one.
function bruteForce({ scores, ages }) {
  const n = scores.length
  let best = 0
  for (let mask = 1; mask < 1 << n; mask++) {
    const members = [...Array(n).keys()].filter(i => mask & (1 << i))
    const valid = members.every(a => members.every(b => !(ages[a] < ages[b] && scores[a] > scores[b])))
    if (valid) best = Math.max(best, members.reduce((sum, i) => sum + scores[i], 0))
  }
  return best
}

test('own sample: an older high scorer is excluded when a younger player scores more', () => {
  const run = buildTrace(parseInput('{"scores":[9,2,8,6],"ages":[1,1,3,3]}'))
  assert.equal(run.result, 16)
})

test('a younger player with a higher score cannot share a team with an older one', () => {
  assert.equal(buildTrace({ scores: [9, 1], ages: [1, 2] }).result, 9)
  assert.equal(buildTrace({ scores: [1, 9], ages: [1, 2] }).result, 10)
})

test('random small teams agree with an exhaustive oracle', () => {
  let state = 17
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 400; t++) {
    const n = 1 + rand(9)
    const input = { scores: Array.from({ length: n }, () => 1 + rand(20)), ages: Array.from({ length: n }, () => 1 + rand(6)) }
    assert.equal(buildTrace(input).result, bruteForce(input), JSON.stringify(input))
  }
})

test('frames use declared phases, valid code lines, and narration', () => {
  const run = buildTrace({ scores: [9, 2, 8, 6], ages: [1, 1, 3, 3] })
  const ids = new Set(phases.map(p => p.id))
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase))
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.message.length > 10)
  }
  assert.equal(run.frames.at(-1).phase, 'answer')
  assert.ok(python.includes('def best_team_score'))
})

test('invalid input is rejected with a message', () => {
  assert.throws(() => parseInput('{"scores":[1],"ages":[1,2]}'), /same length/)
  assert.throws(() => parseInput('[1,2]'), /object/)
})
