import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('examples', () => {
  assert.deepEqual(solve('{"schools":[[11,151],[2,0]],"exam":[[975,10],[966,60],[344,70],[342,80]]}'), [[11, 342], [2, -1]])
  assert.deepEqual(solve('{"schools":[[1,100]],"exam":[[9,10],[5,100]]}'), [[1, 5]])
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('{"schools":[[1,10]],"exam":[[9,5]]}')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random tables match the per-school minimum rule', () => {
  let state = 71
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 100; t++) {
    const scores = [...new Set(Array.from({ length: 1 + rand(6) }, () => rand(1000)))].sort((a, b) => b - a)
    let count = 0
    const exam = scores.map(score => { count += rand(4); return [score, count] })
    const schools = Array.from({ length: 1 + rand(4) }, (_, i) => [i + 1, rand(20)])
    const expected = schools.map(([id, cap]) => {
      const ok = exam.filter(([, c]) => c <= cap).map(([s]) => s)
      return [id, ok.length ? Math.min(...ok) : -1]
    })
    assert.deepEqual(solve(JSON.stringify({ schools, exam })), expected)
  }
})
