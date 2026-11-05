import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: maximum bipartite matching between catchers and runners by augmenting paths.
function oracle(team, dist) {
  const catchers = [], runners = []
  team.forEach((v, i) => (v === 1 ? catchers : runners).push(i))
  const match = new Map()
  const tryCatch = (c, seen) => {
    for (const r of runners) {
      if (Math.abs(r - c) > dist || seen.has(r)) continue
      seen.add(r)
      if (!match.has(r) || tryCatch(match.get(r), seen)) { match.set(r, c); return true }
    }
    return false
  }
  let total = 0
  for (const c of catchers) if (tryCatch(c, new Set())) total++
  return total
}

test('examples', () => {
  assert.equal(solve('{"team":[0,1,0,1,0],"dist":3}'), 2)
  assert.equal(solve('{"team":[1,0,0,0,0,1],"dist":1}'), 2)
  assert.equal(solve('{"team":[1,0,1,0,1,0,1,0],"dist":2}'), 4)
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('{"team":[1,0],"dist":1}')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random inputs match the matching oracle', () => {
  let state = 89
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rand(12)
    const team = Array.from({ length: n }, () => rand(2))
    const dist = 1 + rand(5)
    assert.equal(solve(JSON.stringify({ team, dist })), oracle(team, dist))
  }
})
