import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'
import { spawnSync } from 'node:child_process'

const solve = n => buildTrace(parseInput(JSON.stringify(n))).result

test('52 official examples', () => {
  assert.equal(solve(4), 2)
  assert.equal(solve(1), 1)
})

test('52 known counts for small boards', () => {
  assert.equal(solve(2), 0)
  assert.equal(solve(3), 0)
  assert.equal(solve(5), 10)
  assert.equal(solve(6), 4)
})

test('52 rejects sizes outside the visualized range', () => {
  assert.throws(() => parseInput('0'))
  assert.throws(() => parseInput('7'))
  assert.throws(() => parseInput('2.5'))
})

// Independent oracle: bitmask search over columns and both diagonal directions.
function oracle(n) {
  const full = (1 << n) - 1
  const go = (cols, d1, d2) => {
    if (cols === full) return 1
    let total = 0
    let free = full & ~(cols | d1 | d2)
    while (free) {
      const bit = free & -free
      free -= bit
      total += go(cols | bit, ((d1 | bit) << 1) & full, (d2 | bit) >> 1)
    }
    return total
  }
  return go(0, 0, 0)
}

test('52 known totals for boards 1 to 9 agree with the bitmask oracle', () => {
  const known = [1, 0, 0, 2, 10, 4, 40, 92, 352]
  for (let n = 1; n <= 9; n++) assert.equal(oracle(n), known[n - 1], `n=${n}`)
})

test('52 seeded random sizes from 1 to 6 match the bitmask oracle', () => {
  let seed = 52
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 60; t++) {
    const n = 1 + rnd(6)
    assert.equal(solve(n), oracle(n), `n=${n}`)
  }
})

test('52 displayed Python returns the same counts', () => {
  const cases = [1, 2, 3, 4, 5, 6]
  const result = spawnSync(process.env.PYTHON || 'python', ['-c', 'import json,sys\np=json.load(sys.stdin)\nexec(p["source"])\nprint(json.dumps([total_n_queens(c) for c in p["cases"]]))'], {
    input: JSON.stringify({ source: python, cases }), encoding: 'utf8',
  })
  assert.equal(result.status, 0, result.stderr || result.error?.message)
  assert.deepEqual(JSON.parse(result.stdout), cases.map(solve))
})
