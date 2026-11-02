import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

function runPython(call) {
  const r = spawnSync('python3', ['-I', '-c', `${python}\nprint(${call})`], { encoding: 'utf8' })
  assert.equal(r.status, 0, r.stderr)
  return r.stdout.trim()
}

test('2562 worked examples', () => {
  assert.equal(solve([7, 52, 2, 4]), 596)
  assert.equal(solve([5, 14, 13, 8, 12]), 673)
  assert.equal(solve([3]), 3)
  assert.equal(solve([10, 2]), 102)
})

test('2562 every frame points at an executable python line', () => {
  const lines = python.split('\n')
  for (const frame of buildTrace(parseInput('{"nums": [7, 52, 2, 4]}')).frames) {
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= lines.length)
    assert.ok(lines[frame.pythonLine - 1].trim().length > 0)
  }
})

test('2562 python export agrees with the trace', () => {
  for (const nums of [[7, 52, 2, 4], [5, 14, 13, 8, 12], [3], [10, 2]]) {
    assert.equal(runPython(`findTheArrayConcVal([${nums.join(', ')}])`), String(solve(nums)))
  }
})

test('2562 random inputs match a shift and pop oracle', () => {
  let seed = 2562
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % k }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(9) }, () => 1 + rnd(999))
    const arr = [...nums]
    let expected = 0
    while (arr.length > 1) {
      const first = arr.shift()
      const last = arr.pop()
      expected += Number(`${first}${last}`)
    }
    if (arr.length === 1) expected += arr[0]
    assert.equal(solve(nums), expected, JSON.stringify(nums))
  }
})

test('2562 rejects an empty list', () => {
  assert.throws(() => parseInput('{"nums": []}'))
})
