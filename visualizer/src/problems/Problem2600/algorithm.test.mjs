import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (numOnes, numZeros, numNegOnes, k) => buildTrace(parseInput(JSON.stringify({ numOnes, numZeros, numNegOnes, k }))).result

function runPython(call) {
  const r = spawnSync('python3', ['-I', '-c', `${python}\nprint(${call})`], { encoding: 'utf8' })
  assert.equal(r.status, 0, r.stderr)
  return r.stdout.trim()
}

test('2600 worked examples', () => {
  assert.equal(solve(3, 2, 0, 2), 2)
  assert.equal(solve(3, 2, 3, 4), 3)
  assert.equal(solve(0, 0, 5, 3), -3)
  assert.equal(solve(5, 0, 0, 5), 5)
})

test('2600 every frame points at an executable python line', () => {
  const lines = python.split('\n')
  for (const frame of buildTrace(parseInput('{"numOnes": 3, "numZeros": 2, "numNegOnes": 3, "k": 4}')).frames) {
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= lines.length)
    assert.ok(lines[frame.pythonLine - 1].trim().length > 0)
  }
})

test('2600 python export agrees with the trace', () => {
  assert.equal(runPython('kItemsWithMaximumSum(3, 2, 0, 2)'), '2')
  assert.equal(runPython('kItemsWithMaximumSum(3, 2, 3, 4)'), '3')
  assert.equal(runPython('kItemsWithMaximumSum(0, 0, 5, 3)'), '-3')
})

test('2600 random bags match a sort-and-take-top-k oracle', () => {
  let seed = 2600
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % m }
  for (let t = 0; t < 300; t++) {
    const a = rnd(8), b = rnd(8), c = rnd(8)
    const k = rnd(a + b + c + 1)
    const bag = [...Array(a).fill(1), ...Array(b).fill(0), ...Array(c).fill(-1)].sort((x, y) => y - x)
    const expected = bag.slice(0, k).reduce((s, v) => s + v, 0)
    assert.equal(solve(a, b, c, k), expected, `${a} ${b} ${c} ${k}`)
  }
})

test('2600 rejects k larger than the bag', () => {
  assert.throws(() => parseInput('{"numOnes": 1, "numZeros": 1, "numNegOnes": 1, "k": 4}'))
})
