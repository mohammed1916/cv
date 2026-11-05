import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('examples', () => {
  assert.deepEqual(solve('{"original":[1,2,3,4],"m":2,"n":2}'), [[1, 2], [3, 4]])
  assert.deepEqual(solve('{"original":[1,2,3],"m":1,"n":3}'), [[1, 2, 3]])
  assert.deepEqual(solve('{"original":[1,2],"m":1,"n":3}'), [])
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('{"original":[1,2],"m":1,"n":2}')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random sizes keep the values in order', () => {
  let state = 347
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 150; t++) {
    const m = 1 + rand(5), n = 1 + rand(5)
    const len = m * n + (rand(4) === 0 ? 1 : 0)
    const original = Array.from({ length: len }, (_, i) => i + 1)
    const got = solve(JSON.stringify({ original, m, n }))
    if (len !== m * n) assert.deepEqual(got, [])
    else assert.deepEqual(got.flat(), original)
    if (len === m * n) assert.equal(got.length, m)
  }
})
