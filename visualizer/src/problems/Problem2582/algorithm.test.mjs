import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (n, time) => buildTrace(parseInput(JSON.stringify({ n, time }))).result

function runPython(call) {
  const r = spawnSync('python3', ['-I', '-c', `${python}\nprint(${call})`], { encoding: 'utf8' })
  assert.equal(r.status, 0, r.stderr)
  return r.stdout.trim()
}

test('2582 worked examples', () => {
  assert.equal(solve(4, 5), 2)
  assert.equal(solve(3, 2), 3)
  assert.equal(solve(2, 1), 2)
  assert.equal(solve(2, 2), 1)
})

test('2582 every frame points at an executable python line', () => {
  const lines = python.split('\n')
  for (const frame of buildTrace(parseInput('{"n": 4, "time": 5}')).frames) {
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= lines.length)
    assert.ok(lines[frame.pythonLine - 1].trim().length > 0)
  }
})

test('2582 python export agrees with the trace', () => {
  for (const [n, time] of [[4, 5], [3, 2], [2, 1], [10, 999]]) {
    assert.equal(runPython(`passThePillow(${n}, ${time})`), String(solve(n, time)))
  }
})

test('2582 random inputs match a closed-form period oracle', () => {
  let seed = 2582
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % k }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(99)
    const time = 1 + rnd(1000)
    const period = 2 * (n - 1)
    const k = time % period
    const expected = k < n ? k + 1 : period - k + 1
    assert.equal(solve(n, time), expected, `n=${n} time=${time}`)
  }
})

test('2582 rejects n below 2', () => {
  assert.throws(() => parseInput('{"n": 1, "time": 3}'))
})
