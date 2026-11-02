import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = n => buildTrace(parseInput(JSON.stringify({ n }))).result

function runPython(call) {
  const r = spawnSync('python3', ['-I', '-c', `${python}\nprint(${call})`], { encoding: 'utf8' })
  assert.equal(r.status, 0, r.stderr)
  return r.stdout.trim()
}

test('2544 worked examples', () => {
  assert.equal(solve(521), 4)
  assert.equal(solve(111), 1)
  assert.equal(solve(886996), 0)
  assert.equal(solve(1), 1)
  assert.equal(solve(1000000000), 1)
})

test('2544 every frame points at an executable python line', () => {
  const lines = python.split('\n')
  const trace = buildTrace(parseInput('{"n": 521}'))
  for (const frame of trace.frames) {
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && frame.pythonLine <= lines.length)
    assert.ok(lines[frame.pythonLine - 1].trim().length > 0)
  }
})

test('2544 python export agrees with the trace', () => {
  for (const n of [521, 111, 886996, 1, 90210, 1000000000]) {
    assert.equal(runPython(`alternating_digit_sum(${n})`), String(solve(n)))
  }
})

test('2544 random inputs match an index-parity oracle', () => {
  let seed = 2544
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % k }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(1000000)
    const expected = [...String(n)].reduce((acc, ch, i) => acc + (i % 2 === 0 ? 1 : -1) * Number(ch), 0)
    assert.equal(solve(n), expected, `n=${n}`)
  }
})

test('2544 rejects non-positive and out-of-range n', () => {
  assert.throws(() => parseInput('{"n": 0}'))
  assert.throws(() => parseInput('{"n": 1000000001}'))
})
