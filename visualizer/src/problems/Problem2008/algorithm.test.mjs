import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: try every subset of rides and keep the best non-overlapping one.
function oracle(n, rides) {
  let best = 0
  for (let m = 0; m < 1 << rides.length; m++) {
    const chosen = rides.filter((_, i) => m & (1 << i)).sort((a, b) => a[0] - b[0])
    let ok = true, total = 0
    for (let i = 0; i < chosen.length; i++) {
      if (i > 0 && chosen[i][0] < chosen[i - 1][1]) { ok = false; break }
      total += chosen[i][1] - chosen[i][0] + chosen[i][2]
    }
    if (ok) best = Math.max(best, total)
  }
  return best
}

test('examples', () => {
  assert.equal(solve('{"n":5,"rides":[[2,5,4],[1,5,1]]}'), 7)
  assert.equal(solve('{"n":20,"rides":[[1,6,1],[3,10,2],[10,12,3],[12,20,2],[13,18,1]]}'), 24)
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('{"n":3,"rides":[[1,3,1]]}')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random rides match the subset oracle', () => {
  let state = 227
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 150; t++) {
    const n = 2 + rand(10)
    const rides = Array.from({ length: 1 + rand(7) }, () => {
      const s = 1 + rand(n - 1)
      return [s, s + 1 + rand(n - s), rand(5)]
    })
    assert.equal(solve(JSON.stringify({ n, rides })), oracle(n, rides), JSON.stringify({ n, rides }))
  }
})
