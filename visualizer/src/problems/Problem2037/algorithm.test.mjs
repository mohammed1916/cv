import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: try every permutation of seats for the students (small n).
function oracle(seats, students) {
  let best = Infinity
  const used = Array(seats.length).fill(false)
  const go = (i, total) => {
    if (total >= best) return
    if (i === students.length) { best = total; return }
    for (let s = 0; s < seats.length; s++) {
      if (used[s]) continue
      used[s] = true
      go(i + 1, total + Math.abs(students[i] - seats[s]))
      used[s] = false
    }
  }
  go(0, 0)
  return best
}

test('examples', () => {
  assert.equal(solve('{"seats":[3,1,5],"students":[2,7,4]}'), 4)
  assert.equal(solve('{"seats":[4,1,5,9],"students":[1,3,2,6]}'), 7)
  assert.equal(solve('{"seats":[2,2,6,6],"students":[1,3,2,6]}'), 4)
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('{"seats":[1],"students":[2]}')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random inputs match the permutation oracle', () => {
  let state = 491
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 150; t++) {
    const n = 1 + rand(6)
    const seats = Array.from({ length: n }, () => 1 + rand(20))
    const students = Array.from({ length: n }, () => 1 + rand(20))
    assert.equal(solve(JSON.stringify({ seats, students })), oracle(seats, students), JSON.stringify({ seats, students }))
  }
})
