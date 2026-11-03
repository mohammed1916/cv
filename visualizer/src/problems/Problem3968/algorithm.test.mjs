import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = moves => buildTrace(moves).result

// Independent oracle: try all four directions at every underscore.
function oracle(moves) {
  const blanks = [...moves].filter(c => c === '_').length
  const deltas = { U: [0, 1], D: [0, -1], L: [-1, 0], R: [1, 0] }
  let best = 0
  for (let code = 0; code < 4 ** blanks; code++) {
    let x = 0, y = 0, c = code
    for (const ch of moves) {
      let d
      if (ch === '_') { d = Object.values(deltas)[c % 4]; c = Math.floor(c / 4) } else d = deltas[ch]
      x += d[0]; y += d[1]
    }
    best = Math.max(best, Math.abs(x) + Math.abs(y))
  }
  return best
}

test('3968 authored presets', () => {
  assert.equal(solve('L_R_U'), 3)
  assert.equal(solve('__LLU'), 5)
})

test('3968 no underscores and only underscores', () => {
  assert.equal(solve('RRUD'), 2)
  assert.equal(solve('____'), 4)
})

test('3968 rejects other characters', () => {
  assert.throws(() => parseInput('LXR'))
  assert.throws(() => parseInput(''))
})

test('3968 random strings match the four-direction oracle', () => {
  let seed = 3968
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const moves = Array.from({ length: 1 + rnd(8) }, () => 'UDLR_'[rnd(5)]).join('')
    assert.equal(solve(moves), oracle(moves), moves)
  }
})
