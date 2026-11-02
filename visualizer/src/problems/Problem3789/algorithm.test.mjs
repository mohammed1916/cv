import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, lineOf, pythonLineOf, code, python } from './algorithm.js'

const solve = (cost1, cost2, costBoth, need1, need2) => buildTrace({ cost1, cost2, costBoth, need1, need2 }).result

test('3789 official examples', () => {
  assert.equal(solve(3, 2, 1, 3, 2), 3)
  assert.equal(solve(5, 4, 15, 2, 3), 22)
  assert.equal(solve(5, 4, 15, 0, 0), 0)
})

test('3789 every frame names a real pseudocode line and a python line', () => {
  const pythonCount = python.trim().split('\n').length
  for (const input of [{ cost1: 3, cost2: 2, costBoth: 1, need1: 3, need2: 2 }, { cost1: 5, cost2: 4, costBoth: 15, need1: 0, need2: 0 }]) {
    const { frames } = buildTrace(input)
    for (const frame of frames) {
      assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
      assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && frame.pythonLine <= pythonCount)
      assert.ok(typeof frame.phase === 'string' && frame.message.length > 0)
    }
  }
})

test('3789 line lookups throw when the text is missing', () => {
  assert.equal(lineOf('return best'), 9)
  assert.equal(pythonLineOf('return best'), 9)
  assert.throws(() => lineOf('only2 is max'), /Missing pseudocode line/)
  assert.throws(() => pythonLineOf('best = unset'), /Missing python line/)
})

test('3789 rejects out-of-range or non-integer values', () => {
  assert.throws(() => parseInput('{"cost1":0,"cost2":2,"costBoth":1,"need1":3,"need2":2}'))
  assert.throws(() => parseInput('{"cost1":3,"cost2":2,"costBoth":1,"need1":1.5,"need2":2}'))
  assert.throws(() => parseInput('{"cost1":3,"cost2":2,"costBoth":1,"need1":1000000001,"need2":2}'))
})

test('3789 zero needs need no purchases and keep an all-zero winning plan', () => {
  const run = buildTrace({ cost1: 5, cost2: 4, costBoth: 15, need1: 0, need2: 0 })
  assert.equal(run.result, 0)
  assert.deepEqual(run.plan, { both: 0, only1: 0, only2: 0, coverage1: 0, coverage2: 0, excess1: 0, excess2: 0, total: 0 })
  const rows = run.frames.at(-1).rows
  assert.equal(rows.length, 3)
  assert.ok(rows.every(row => row.total === 0))
})

test('3789 expensive combined items are rejected in favour of single units', () => {
  const run = buildTrace({ cost1: 3, cost2: 2, costBoth: 10, need1: 4, need2: 5 })
  assert.equal(run.result, 22)
  assert.equal(run.plan.both, 0)
  assert.equal(run.plan.only1, 4)
  assert.equal(run.plan.only2, 5)
  const combinedRow = run.frames.find(frame => frame.phase === 'compare' && frame.both === 5)
  assert.equal(combinedRow.candidate.better, false)
})

test('3789 winning plan persists to the done frame and covers both needs', () => {
  const input = { cost1: 3, cost2: 2, costBoth: 1, need1: 3, need2: 2 }
  const run = buildTrace(input)
  const done = run.frames.at(-1)
  assert.equal(done.phase, 'done')
  assert.deepEqual(done.plan, run.plan)
  assert.equal(run.plan.total, run.result)
  assert.equal(run.plan.both, 3)
  assert.equal(run.plan.excess2, 1)
  assert.ok(run.plan.coverage1 >= input.need1 && run.plan.coverage2 >= input.need2)
  assert.equal(done.rows.filter(row => row.isBest).length, 1)
  assert.equal(done.rows.find(row => row.isBest).total, run.result)
  const lastUpdate = run.frames.map(f => f.phase).lastIndexOf('update')
  for (const frame of run.frames.slice(lastUpdate)) {
    assert.deepEqual(frame.plan, run.plan)
  }
})

// Independent oracle: try every count of each unit type for small needs.
function oracle(cost1, cost2, costBoth, need1, need2) {
  let best = Infinity
  for (let a = 0; a <= need1; a++) {
    for (let b = 0; b <= need2; b++) {
      for (let c = 0; c <= Math.max(need1, need2); c++) {
        if (a + c >= need1 && b + c >= need2) best = Math.min(best, a * cost1 + b * cost2 + c * costBoth)
      }
    }
  }
  return best
}

test('3789 random small inputs match a brute-force oracle', () => {
  let seed = 3789
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const cost1 = 1 + rnd(12), cost2 = 1 + rnd(12), costBoth = 1 + rnd(30)
    const need1 = rnd(7), need2 = rnd(7)
    assert.equal(solve(cost1, cost2, costBoth, need1, need2), oracle(cost1, cost2, costBoth, need1, need2),
      JSON.stringify({ cost1, cost2, costBoth, need1, need2 }))
  }
})
