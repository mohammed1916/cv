import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = bits => buildTrace(parseInput(JSON.stringify({ bits })))

test('1538 worked presets', () => {
  let run = solve([1, 0, 1, 1, 1, 0, 1])
  assert.equal([1, 0, 1, 1, 1, 0, 1][run.result], 1)
  run = solve([0, 0, 1, 0, 0])
  assert.equal([0, 0, 1, 0, 0][run.result], 0)
  assert.equal(solve([1, 0, 1, 0, 1, 0]).result, -1)
})

test('1538 rejects bad input', () => {
  assert.throws(() => parseInput('{"bits":[1,0,1,0]}'))
  assert.throws(() => parseInput('{"bits":[1,0,2,0,1]}'))
})

// Brute oracle: count bits directly and check the returned index.
test('1538 random arrays match a direct count and stay within the query budget', () => {
  let seed = 1538
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 500; t++) {
    const n = 5 + rnd(16)
    const bits = Array.from({ length: n }, () => rnd(2))
    const ones = bits.filter(b => b === 1).length
    const zeros = n - ones
    const run = solve(bits)
    if (ones === zeros) assert.equal(run.result, -1, JSON.stringify(bits))
    else {
      const majority = ones > zeros ? 1 : 0
      assert.ok(run.result >= 0 && run.result < n, JSON.stringify(bits))
      assert.equal(bits[run.result], majority, JSON.stringify(bits))
    }
    assert.ok(run.queries <= n, `${n} bits used ${run.queries} queries`)
    assert.equal(run.frames.at(-1).phase, 'done')
  }
})
