import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: simulate the walk day by day (small n, so the day count is small).
function oracle(nextVisit) {
  const n = nextVisit.length
  const visits = new Array(n).fill(0)
  let cur = 0, day = 0, seen = 1
  visits[0] = 1
  while (seen < n) {
    const next = visits[cur] % 2 === 1 ? nextVisit[cur] : (cur + 1) % n
    day++
    cur = next
    if (visits[cur] === 0) seen++
    visits[cur]++
  }
  return day
}

test('examples', () => {
  assert.equal(solve('[0,0]'), 2)
  assert.equal(solve('[0,0,2]'), 6)
  assert.equal(solve('[0,1,2,3]'), 6)
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('[0,0,2]')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random walks match the day-by-day simulation', () => {
  let state = 157
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 150; t++) {
    const n = 2 + rand(7)
    const nextVisit = Array.from({ length: n }, (_, i) => rand(i + 1))
    assert.equal(solve(JSON.stringify(nextVisit)), oracle(nextVisit) % 1000000007, JSON.stringify(nextVisit))
  }
})
