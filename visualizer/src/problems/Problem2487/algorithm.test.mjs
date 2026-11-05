import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = values => buildTrace({ values }).result
const PY = python.split('\n')
const PYTHON = process.env.PYTHON || 'python3'
const runPy = values => execFileSync(PYTHON, ['-I', '-c', `${python}\nprint(remove_nodes(${JSON.stringify(values)}))`]).toString().trim()

function brute(values) {
  return values.filter((x, i) => !values.slice(i + 1).some(y => y > x))
}

test('2487 worked examples', () => {
  assert.deepEqual(solve([4, 9, 1, 7, 2]), [9, 7, 2])
  assert.deepEqual(solve([1, 1, 1]), [1, 1, 1])
  assert.deepEqual(solve([4]), [4])
})

test('2487 frames point at real python lines', () => {
  for (const f of buildTrace({ values: [1, 2] }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2487 rejects bad input', () => {
  assert.throws(() => parseInput('{"values":[]}'))
})

test('2487 random lists match a direct check and the python mirror', () => {
  let seed = 2487
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 150; t++) {
    const values = Array.from({ length: 1 + rnd(9) }, () => 1 + rnd(9))
    assert.deepEqual(solve(values), brute(values), JSON.stringify(values))
    if (t < 8) assert.equal(runPy(values), `[${brute(values).join(', ')}]`)
  }
})
