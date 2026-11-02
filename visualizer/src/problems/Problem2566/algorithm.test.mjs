import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = num => buildTrace(parseInput(JSON.stringify({ num }))).result

function runPython(call) {
  const r = spawnSync('python3', ['-I', '-c', `${python}\nprint(${call})`], { encoding: 'utf8' })
  assert.equal(r.status, 0, r.stderr)
  return r.stdout.trim()
}

test('2566 worked examples', () => {
  assert.equal(solve(11891), 99009)
  assert.equal(solve(90), 99)
  assert.equal(solve(1), 9)
  assert.equal(solve(9), 9)
})

test('2566 every frame points at an executable python line', () => {
  const lines = python.split('\n')
  for (const frame of buildTrace(parseInput('{"num": 11891}')).frames) {
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= lines.length)
    assert.ok(lines[frame.pythonLine - 1].trim().length > 0)
  }
})

test('2566 python export agrees with the trace', () => {
  for (const num of [11891, 90, 1, 9, 123456]) {
    assert.equal(runPython(`maxDiff(${num})`), String(solve(num)))
  }
})

test('2566 random inputs match a remap-every-pair oracle', () => {
  let seed = 2566
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % k }
  for (let t = 0; t < 300; t++) {
    const num = 1 + rnd(99999999)
    const text = String(num)
    const values = []
    for (const d of new Set(text)) {
      for (let e = 0; e <= 9; e++) values.push(Number(text.split(d).join(String(e))))
    }
    assert.equal(solve(num), Math.max(...values) - Math.min(...values), `num=${num}`)
  }
})

test('2566 rejects non-positive input', () => {
  assert.throws(() => parseInput('{"num": 0}'))
})
