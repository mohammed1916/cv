import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (damage, armor) => buildTrace(parseInput(JSON.stringify({ damage, armor }))).result

test('2214 worked examples', () => {
  assert.equal(solve([2, 7, 4, 3], 4), 13)
  assert.equal(solve([2, 5, 3, 4], 7), 10)
  assert.equal(solve([3, 3, 3], 2), 8)
  assert.equal(solve([1], 1), 1)
})

test('2214 rejects invalid input', () => {
  assert.throws(() => parseInput('{"damage":[],"armor":1}'))
  assert.throws(() => parseInput('{"damage":[0],"armor":1}'))
  assert.throws(() => parseInput('{"damage":[1],"armor":0}'))
})

// Oracle: try every level for the armor (or none). Health after each level is start minus the running damage, so the
// start must exceed the largest running total.
function oracle(damage, armor) {
  let best = Infinity
  for (let use = -1; use < damage.length; use++) {
    let need = 1
    let hp = 0
    for (let i = 0; i < damage.length; i++) {
      const d = i === use ? Math.max(0, damage[i] - armor) : damage[i]
      hp += d
      need = Math.max(need, hp + 1)
    }
    best = Math.min(best, need)
  }
  return best
}

test('2214 random inputs match a choose-the-armor-level oracle', () => {
  let seed = 2214
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const damage = Array.from({ length: 1 + rnd(6) }, () => 1 + rnd(9))
    const armor = 1 + rnd(10)
    assert.equal(solve(damage, armor), oracle(damage, armor), JSON.stringify({ damage, armor }))
  }
})

test('2214 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('{"damage":[2,7,4,3],"armor":4}')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
