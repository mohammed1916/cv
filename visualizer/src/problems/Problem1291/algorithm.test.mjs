import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const solve = (low, high) => buildTrace(parseInput(JSON.stringify({ low, high }))).result

test('1291 sample ranges list the consecutive-digit numbers', () => {
  assert.deepEqual(solve(100, 300), [123, 234])
  assert.deepEqual(solve(1000, 13000), [1234, 2345, 3456, 4567, 5678, 6789, 12345])
  assert.deepEqual(solve(90, 99), [])
})

test('1291 a single value range is handled exactly', () => {
  assert.deepEqual(solve(12, 12), [12])
  assert.deepEqual(solve(13, 13), [])
})

test('1291 frames use declared phases and valid line numbers', () => {
  const ids = new Set(phases.map(p => p.id))
  const run = buildTrace({ low: 10, high: 30 })
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase))
    assert.ok(f.activeLine >= 1 && f.pythonLine >= 1, f.phase)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('1291 rejects malformed ranges', () => {
  assert.throws(() => parseInput('{"low":5,"high":2}'), /1 <= low <= high/)
  assert.throws(() => parseInput('[1,2]'), /object/)
  assert.throws(() => parseInput('{"low":0,"high":2}'), /1 <= low/)
})

test('1291 matches a brute-force digit test over random ranges', () => {
  const consecutive = n => { const s = String(n); for (let i = 1; i < s.length; i++) if (Number(s[i]) !== Number(s[i - 1]) + 1) return false; return true }
  let seed = 9
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const low = 1 + rnd(50000)
    const high = low + rnd(50000)
    const expected = []
    for (let n = low; n <= high; n++) if (consecutive(n)) expected.push(n)
    assert.deepEqual(solve(low, high), expected, `${low}..${high}`)
  }
})
