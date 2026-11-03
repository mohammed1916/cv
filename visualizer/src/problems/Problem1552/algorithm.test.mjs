import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: try every choice of m positions and keep the largest smallest adjacent gap.
function oracle(positions, m) {
  const sorted = [...positions].sort((a, b) => a - b)
  let best = 0
  const pick = (start, chosen) => {
    if (chosen.length === m) {
      let gap = Infinity
      for (let i = 1; i < chosen.length; i++) gap = Math.min(gap, chosen[i] - chosen[i - 1])
      best = Math.max(best, gap)
      return
    }
    for (let i = start; i < sorted.length; i++) pick(i + 1, [...chosen, sorted[i]])
  }
  pick(0, [])
  return best
}

test('a hand-checked example', () => {
  assert.equal(buildTrace({ positions: [1, 2, 3, 4, 7], m: 3 }).result, 3)
  assert.equal(buildTrace({ positions: [5, 4, 3, 2, 1, 1000000000], m: 2 }).result, 999999999)
})

test('small instances agree with the brute-force oracle', () => {
  let state = 23
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 250; t++) {
    const pool = Array.from({ length: 30 }, (_, i) => i + 1)
    const size = 2 + rand(6)
    const positions = []
    while (positions.length < size) {
      const v = pool[rand(pool.length)]
      if (!positions.includes(v)) positions.push(v)
    }
    const m = 2 + rand(size - 1)
    assert.equal(buildTrace({ positions, m }).result, oracle(positions, m), JSON.stringify({ positions, m }))
  }
})

test('every frame points at real code and Python lines', () => {
  for (const frame of buildTrace({ positions: [1, 2, 8, 9], m: 2 }).frames) {
    assert.ok(frame.activeLine >= 1, frame.message)
    assert.ok(frame.pythonLine >= 1, frame.message)
  }
})

test('malformed input is rejected', () => {
  assert.throws(() => parseInput('{"positions":[1,1],"m":2}'), /distinct/)
  assert.throws(() => parseInput('{"positions":[1,2,3],"m":4}'), /m is/)
  assert.throws(() => parseInput('{"positions":[1,31],"m":2}'), /positions/)
})
