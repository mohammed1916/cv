import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('examples keep all nine combinations', () => {
  const result = solve('[[1,"Android","Reading"],[2,"Web","Sports"],[3,"Android","Reading"]]')
  assert.equal(result.length, 9)
  assert.deepEqual(result.find(([p, n]) => p === 'Android' && n === 'Reading'), ['Android', 'Reading', 2])
  assert.deepEqual(result.find(([p, n]) => p === 'IOS' && n === 'Programming'), ['IOS', 'Programming', 0])
  assert.equal(result.reduce((sum, row) => sum + row[2], 0), 3)
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('[[1,"IOS","Sports"]]')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random tables match a direct count', () => {
  let state = 79
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  const P = ['Android', 'IOS', 'Web'], N = ['Reading', 'Sports', 'Programming']
  for (let t = 0; t < 100; t++) {
    const rows = Array.from({ length: rand(20) }, (_, i) => [i + 1, P[rand(3)], N[rand(3)]])
    const result = solve(JSON.stringify(rows))
    for (const [p, n, c] of result) {
      assert.equal(c, rows.filter(r => r[1] === p && r[2] === n).length)
    }
    assert.equal(result.length, 9)
  }
})
