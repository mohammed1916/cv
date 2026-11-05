import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: a/b is reduced when no integer d above 1 divides both.
function oracle(n) {
  const out = []
  for (let b = 2; b <= n; b++) {
    for (let a = 1; a < b; a++) {
      let shared = false
      for (let d = 2; d <= a; d++) if (a % d === 0 && b % d === 0) { shared = true; break }
      if (!shared) out.push(`${a}/${b}`)
    }
  }
  return out
}

test('n = 6 lists the eleven reduced fractions in denominator order', () => {
  assert.deepEqual(solve('6'), ['1/2', '1/3', '2/3', '1/4', '3/4', '1/5', '2/5', '3/5', '4/5', '1/6', '5/6'])
})

test('n = 2 and n = 8 agree with the oracle', () => {
  assert.deepEqual(solve('2'), ['1/2'])
  assert.deepEqual(solve('8'), oracle(8))
})

test('every n from 1 to 40 matches the oracle', () => {
  for (let n = 1; n <= 40; n++) assert.deepEqual(solve(String(n)), oracle(n), `n=${n}`)
})

test('frames map to real code and Python lines and end with the result', () => {
  const run = buildTrace(7)
  const ids = new Set(phases.map(p => p.id))
  const codeLines = code.length
  const pyLines = python.split('\n').length
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= codeLines, frame.message)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines, frame.message)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('invalid n is rejected', () => {
  assert.throws(() => parseInput('0'), /1 to 100/)
  assert.throws(() => parseInput('101'), /1 to 100/)
  assert.throws(() => parseInput('2.5'), /whole number/)
})
