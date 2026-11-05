import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

function brute(pattern) {
  let best = null
  for (let h = 0; h < 24; h++) for (let m = 0; m < 60; m++) {
    const s = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    if ([...pattern].every((c, i) => c === '?' || c === s[i]) && (best === null || s > best)) best = s
  }
  return best
}

test('1736 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 3)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 6)
  assert.ok(python.includes('def maximumTime'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1736 agrees with a search over all valid times', () => {
  const digits = '0123456789'
  let seed = 211
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let t = 0; t < 400; t++) {
    const chars = '00:00'.split('').map((c, i) => (i === 2 ? ':' : digits[rnd(10)]))
    const pattern = chars.map((c, i) => (i !== 2 && rnd(2) ? '?' : c)).join('')
    if (!/^[0-2]/.test(pattern.replace(/\?/g, '0'))) continue
    const ok = brute(pattern)
    if (ok === null) continue
    assert.equal(buildTrace(pattern).result, ok, pattern)
  }
})

test('1736 rejects invalid input', () => {
  assert.throws(() => parseInput('"9?:00"'))
  assert.throws(() => parseInput('"12:3"'))
})
