import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (bottom, top, special) => buildTrace(parseInput(JSON.stringify({ bottom, top, special }))).result

test('2274 official examples', () => {
  assert.equal(solve(2, 9, [4, 6]), 3)
  assert.equal(solve(6, 8, [7, 6, 8]), 0)
})

test('2274 no special floors gives the whole range', () => {
  assert.equal(solve(1, 10, []), 10)
})

test('2274 rejects a special floor outside the range', () => {
  assert.throws(() => parseInput('{"bottom":1,"top":5,"special":[7]}'))
})

// Independent oracle: mark each floor one at a time and scan for the longest unmarked run.
function oracle(bottom, top, special) {
  const marked = new Set(special)
  let best = 0
  let run = 0
  for (let f = bottom; f <= top; f++) {
    run = marked.has(f) ? 0 : run + 1
    best = Math.max(best, run)
  }
  return best
}

test('2274 random ranges match a floor-scan oracle', () => {
  let seed = 2274
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const bottom = 1 + rnd(50)
    const top = bottom + rnd(40)
    const pool = []
    for (let f = bottom; f <= top; f++) pool.push(f)
    const special = []
    const count = rnd(Math.min(12, pool.length) + 1)
    while (special.length < count) {
      const f = pool[rnd(pool.length)]
      if (!special.includes(f)) special.push(f)
    }
    assert.equal(solve(bottom, top, special), oracle(bottom, top, special), JSON.stringify({ bottom, top, special }))
  }
})
