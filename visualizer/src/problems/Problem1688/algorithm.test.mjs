import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

// Independent oracle: remove one team per match until one remains.
function oracle(n) {
  let teams = n
  let matches = 0
  while (teams > 1) { teams -= 1; matches += 1 }
  return matches
}

test('1688 sample sizes give the expected totals', () => {
  assert.equal(buildTrace(9).result, 8)
  assert.equal(buildTrace(20).result, 19)
  assert.equal(buildTrace(1).result, 0)
})

test('1688 every size from 1 to 200 matches the one-removal oracle', () => {
  for (let n = 1; n <= 200; n++) assert.equal(buildTrace(n).result, oracle(n), `n=${n}`)
})

test('1688 rejects out-of-range input', () => {
  assert.throws(() => parseInput('0'), /1 to 200/)
  assert.throws(() => parseInput('201'), /1 to 200/)
  assert.throws(() => parseInput('2.5'), /1 to 200/)
})

test('1688 frames use declared phases and carry line numbers', () => {
  const ids = new Set(phases.map(p => p.id))
  for (const frame of buildTrace(13).frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.pythonLine >= 1)
  }
})
