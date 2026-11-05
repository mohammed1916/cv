import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: count the lamps covering every integer position in a window around the lamps.
function oracle(lights) {
  let lo = Infinity, hi = -Infinity
  for (const [p, r] of lights) { lo = Math.min(lo, p - r); hi = Math.max(hi, p + r) }
  let best = -1, answer = null
  for (let x = lo; x <= hi; x++) {
    const count = lights.filter(([p, r]) => x >= p - r && x <= p + r).length
    if (count > best) { best = count; answer = x }
  }
  return answer
}

test('examples', () => {
  assert.equal(solve('[[-3,2],[1,2],[3,3]]'), -1)
  assert.equal(solve('[[1,0],[0,1],[2,1]]'), 1)
  assert.equal(solve('[[5,0]]'), 5)
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('[[1,1],[3,1]]')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random lamps match the position-by-position oracle', () => {
  let state = 331
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 200; t++) {
    const lights = Array.from({ length: 1 + rand(8) }, () => [rand(21) - 10, rand(6)])
    assert.equal(solve(JSON.stringify(lights)), oracle(lights), JSON.stringify(lights))
  }
})
