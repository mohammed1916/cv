import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (workers, stations) => buildTrace({ workers, stations }).result

test('4026 small hand cases', () => {
  assert.equal(solve('a', 'a'), 0)
  assert.equal(solve('ab', 'ab'), 1)
  assert.equal(solve('ab', 'acbb'), 3)
  assert.equal(solve('aa', 'abaa'), 3)
})

test('4026 rejects strings with no complete assignment', () => {
  assert.throws(() => parseInput('{"workers":"ba","stations":"ab"}'))
  assert.throws(() => parseInput('{"workers":"Ab","stations":"ab"}'))
})

// Brute oracle: enumerate every strictly increasing set of station indices that matches the workers.
function brute(workers, stations) {
  let best = 0
  const rec = (i, from, picks) => {
    if (i === workers.length) {
      for (let k = 1; k < picks.length; k++) best = Math.max(best, picks[k] - picks[k - 1])
      return
    }
    for (let j = from; j < stations.length; j++) {
      if (stations[j] === workers[i]) rec(i + 1, j + 1, [...picks, j])
    }
  }
  rec(0, 0, [])
  return best
}

test('4026 matches an exhaustive assignment oracle', () => {
  let seed = 4026
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const letters = 'abc'
  const word = len => Array.from({ length: len }, () => letters[rnd(3)]).join('')
  let checked = 0
  for (let t = 0; t < 400; t++) {
    const stations = word(1 + rnd(9))
    const workers = word(1 + rnd(Math.min(4, stations.length)))
    let feasible = true
    try {
      parseInput(JSON.stringify({ workers, stations }))
    } catch {
      feasible = false
    }
    if (!feasible) continue
    checked++
    assert.equal(solve(workers, stations), brute(workers, stations), JSON.stringify({ workers, stations }))
  }
  assert.ok(checked > 50)
})

test('4026 frames reference valid pseudocode and python lines', () => {
  const run = buildTrace({ workers: 'abb', stations: 'abacbb' })
  const pyLines = python.split('\n').length
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines)
  }
})
