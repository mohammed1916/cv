import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result
const fmt = list => `[${list.join(', ')}]`

function runPython(call) {
  const r = spawnSync('python3', ['-I', '-c', `${python}\nprint(${call})`], { encoding: 'utf8' })
  assert.equal(r.status, 0, r.stderr)
  return r.stdout.trim()
}

test('2553 worked examples', () => {
  assert.deepEqual(solve([13, 25, 83, 77]), [1, 3, 2, 5, 8, 3, 7, 7])
  assert.deepEqual(solve([7, 1, 3, 9]), [7, 1, 3, 9])
  assert.deepEqual(solve([10, 100]), [1, 0, 1, 0, 0])
})

test('2553 every frame points at an executable python line', () => {
  const lines = python.split('\n')
  for (const frame of buildTrace(parseInput('{"nums": [13, 25]}')).frames) {
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= lines.length)
    assert.ok(lines[frame.pythonLine - 1].trim().length > 0)
  }
})

test('2553 python export agrees with the trace', () => {
  for (const nums of [[13, 25, 83, 77], [7, 1, 3, 9], [10, 100], [100000]]) {
    assert.equal(runPython(`separateDigits(${fmt(nums)})`), fmt(solve(nums)))
  }
})

test('2553 random inputs match a flat-map oracle', () => {
  let seed = 2553
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % k }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(8) }, () => 1 + rnd(100000))
    const expected = nums.flatMap(v => [...String(v)].map(Number))
    assert.deepEqual(solve(nums), expected, JSON.stringify(nums))
  }
})

test('2553 rejects values outside 1 to 100000', () => {
  assert.throws(() => parseInput('{"nums": [0]}'))
  assert.throws(() => parseInput('{"nums": [100001]}'))
})
