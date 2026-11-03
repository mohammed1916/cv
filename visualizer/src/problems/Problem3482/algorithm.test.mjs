import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

function assertFrames(trace) {
  assert.ok(trace.frames.length >= 2)
  for (const frame of trace.frames) {
    assert.ok(phases.some(phase => phase.id === frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine > 0)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine > 0)
    assert.equal(typeof frame.message, 'string')
    assert.ok(Array.isArray(frame.rows))
  }
  assert.deepEqual(trace.frames.at(-1).rows, trace.result)
}

const person = (employee_id, manager_id, salary) => ({ employee_id, employee_name: `E${employee_id}`, manager_id, salary, department: 'd' })
const SAMPLE = JSON.stringify({ employees: [
  person(1, null, 300), person(2, 1, 200), person(3, 1, 150),
  person(4, 2, 120), person(5, 2, 90), person(6, 4, 60),
] })

test('3482 sample levels, team sizes and budgets', () => {
  const trace = buildTrace(parseInput(SAMPLE))
  assert.deepEqual(trace.result, [
    { employee_id: 1, level: 1, team_size: 5, budget: 920 },
    { employee_id: 2, level: 2, team_size: 3, budget: 470 },
    { employee_id: 3, level: 2, team_size: 0, budget: 150 },
    { employee_id: 4, level: 3, team_size: 1, budget: 180 },
    { employee_id: 5, level: 3, team_size: 0, budget: 90 },
    { employee_id: 6, level: 4, team_size: 0, budget: 60 },
  ])
  assertFrames(trace)
})

test('3482 rejects bad trees', () => {
  assert.throws(() => parseInput(JSON.stringify({ employees: [person(1, null, 1), person(2, null, 1)] })), /exactly one/i)
  assert.throws(() => parseInput(JSON.stringify({ employees: [person(1, null, 1), person(2, 9, 1)] })), /manager/i)
  assert.throws(() => parseInput(JSON.stringify({ employees: [person(1, null, 1), person(2, 3, 1), person(3, 2, 1)] })), /manager/i)
})

// Independent oracle: build a parent array and count depths and subtree sums by walking up each node.
test('3482 random trees match a parent-walk oracle', () => {
  let seed = 3482
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const n = 1 + rnd(9)
    const parent = [-1, ...Array.from({ length: n - 1 }, (_, i) => rnd(i + 1))]
    const salary = Array.from({ length: n }, () => rnd(100))
    const employees = parent.map((p, i) => person(i + 1, p < 0 ? null : p + 1, salary[i]))
    const depthOf = i => { let d = 1; for (let c = parent[i]; c >= 0; c = parent[c]) d++; return d }
    const below = i => parent.map((_, j) => j).filter(j => j !== i && isAbove(i, j))
    function isAbove(i, j) { for (let c = parent[j]; c >= 0; c = parent[c]) if (c === i) return true; return false }
    const expected = parent.map((_, i) => {
      const under = below(i)
      return { employee_id: i + 1, level: depthOf(i), team_size: under.length, budget: salary[i] + under.reduce((s, j) => s + salary[j], 0) }
    })
    assert.deepEqual(solve(JSON.stringify({ employees })), expected, JSON.stringify(parent))
  }
})
