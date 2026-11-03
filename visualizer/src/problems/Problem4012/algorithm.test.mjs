import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (tasks, shifts) => buildTrace(parseInput(JSON.stringify({ tasks, shifts }))).result
const pyLineCount = python.trim().split('\n').length

// Independent oracle: one running progress counter over a single pass of all tasks.
function oracle(tasks, shifts) {
  const prefix = [0]
  for (const t of tasks) prefix.push(prefix[prefix.length - 1] + t)
  const total = prefix[prefix.length - 1]
  let progress = 0
  return shifts.map(budget => {
    if (progress + budget >= total) {
      progress = 0
      return 0
    }
    progress += budget
    return prefix.slice(1).filter(end => end > progress).length
  })
}

test('4012 hand-checked values', () => {
  assert.deepEqual(solve([2, 3], [1, 4, 2]), [2, 0, 1])
  assert.deepEqual(solve([5], [5, 5]), [0, 0])
  assert.deepEqual(solve([1, 1, 1], [1, 1]), [2, 1])
})

test('4012 rejects bad inputs', () => {
  assert.throws(() => parseInput('{"tasks":[],"shifts":[1]}'))
  assert.throws(() => parseInput('{"tasks":[0],"shifts":[1]}'))
  assert.throws(() => parseInput('{"tasks":[1],"shifts":[]}'))
  assert.throws(() => parseInput('[1,2]'))
})

test('4012 simulation agrees with the single-counter oracle on random inputs', () => {
  let seed = 4012
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const tasks = Array.from({ length: 1 + rnd(5) }, () => 1 + rnd(6))
    const shifts = Array.from({ length: 1 + rnd(8) }, () => 1 + rnd(12))
    assert.deepEqual(solve(tasks, shifts), oracle(tasks, shifts), JSON.stringify({ tasks, shifts }))
  }
})

test('4012 frame invariants hold', () => {
  const run = buildTrace(parseInput('{"tasks":[2,3,1],"shifts":[1,4,2,6]}'))
  assert.equal(run.frames[run.frames.length - 1].phase, 'done')
  assert.equal(run.frames[run.frames.length - 1].answer.length, 4)
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLineCount)
    assert.ok(frame.idx >= 0 && frame.idx <= 3)
  }
})
