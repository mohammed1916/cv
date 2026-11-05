import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

function simulate(students, sandwiches) {
  let queue = [...students]
  const stack = [...sandwiches]
  let stuckRounds = 0
  while (queue.length && stuckRounds < queue.length) {
    if (queue[0] === stack[0]) { queue.shift(); stack.shift(); stuckRounds = 0 } else { queue.push(queue.shift()); stuckRounds++ }
  }
  return queue.length
}

test('1700 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 3)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 9)
  assert.ok(python.includes('def countStudents'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1700 matches a literal queue simulation', () => {
  let seed = 61
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(10)
    const students = Array.from({ length: n }, () => rnd(2))
    const sandwiches = Array.from({ length: n }, () => rnd(2))
    assert.equal(buildTrace({ students, sandwiches }).result, simulate(students, sandwiches), JSON.stringify({ students, sandwiches }))
  }
})

test('1700 rejects invalid input', () => {
  assert.throws(() => parseInput('{"students":[2],"sandwiches":[0]}'))
  assert.throws(() => parseInput('{"students":[1,0],"sandwiches":[0]}'))
})
