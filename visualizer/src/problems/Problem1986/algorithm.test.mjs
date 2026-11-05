import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: try every assignment of tasks to at most n sessions.
function oracle(tasks, T) {
  let best = Infinity
  const loads = []
  const place = i => {
    if (loads.length >= best) return
    if (i === tasks.length) { best = Math.min(best, loads.length); return }
    for (let s = 0; s < loads.length; s++) {
      if (loads[s] + tasks[i] <= T) {
        loads[s] += tasks[i]
        place(i + 1)
        loads[s] -= tasks[i]
      }
    }
    loads.push(tasks[i])
    place(i + 1)
    loads.pop()
  }
  place(0)
  return best
}

test('examples', () => {
  assert.equal(solve('{"tasks":[1,2,3],"sessionTime":3}'), 2)
  assert.equal(solve('{"tasks":[3,1,3,1,1],"sessionTime":8}'), 2)
  assert.equal(solve('{"tasks":[1,2,3,4,5],"sessionTime":15}'), 1)
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('{"tasks":[1,2],"sessionTime":3}')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random inputs match the assignment oracle', () => {
  let state = 53
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 120; t++) {
    const T = 2 + rand(6)
    const n = 1 + rand(6)
    const tasks = Array.from({ length: n }, () => 1 + rand(T))
    assert.equal(solve(JSON.stringify({ tasks, sessionTime: T })), oracle(tasks, T))
  }
})
