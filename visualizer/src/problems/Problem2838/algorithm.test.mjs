import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (heroes, monsters) => buildTrace({ heroes, monsters }).result

test('2838 worked heroes and monsters', () => {
  assert.deepEqual(solve([4, 1], [[2, 10], [5, 7], [3, 1]]), [11, 0])
  assert.deepEqual(solve([10], [[10, 4], [11, 9]]), [4])
})

test('2838 equal strength is beatable and extra strength adds nothing', () => {
  assert.deepEqual(solve([5], [[5, 3]]), [3])
  assert.deepEqual(solve([9], [[1, 2], [2, 2]]), [4])
})

test('2838 rejects malformed input', () => {
  assert.throws(() => parseInput('{"heroes":[],"monsters":[[1,1]]}'))
  assert.throws(() => parseInput('{"heroes":[1],"monsters":[[1]]}'))
  assert.throws(() => parseInput('{"heroes":[21],"monsters":[[1,1]]}'))
})

// Oracle: a hero collects every monster it can beat; scan the list instead of sorting or searching.
function oracle(heroes, monsters) {
  return heroes.map(h => monsters.reduce((sum, [s, c]) => (s <= h ? sum + c : sum), 0))
}

test('2838 random inputs match a linear-scan oracle', () => {
  let seed = 2838
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const heroes = Array.from({ length: 1 + rnd(4) }, () => 1 + rnd(12))
    const monsters = Array.from({ length: 1 + rnd(6) }, () => [1 + rnd(12), 1 + rnd(9)])
    assert.deepEqual(solve(heroes, monsters), oracle(heroes, monsters), JSON.stringify({ heroes, monsters }))
  }
})

test('2838 every frame points at real pseudocode and python lines', () => {
  const run = buildTrace({ heroes: [3, 8], monsters: [[6, 2], [2, 5], [8, 1]] })
  const pyLines = python.trim().split('\n').length
  for (const f of run.frames) {
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLines)
    assert.equal(typeof f.message, 'string')
    assert.ok(Array.isArray(f.prefix))
  }
})
