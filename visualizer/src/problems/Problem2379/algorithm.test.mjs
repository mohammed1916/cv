import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (blocks, k) => buildTrace(parseInput(JSON.stringify({ blocks, k }))).result

test('2379 official examples', () => {
  assert.equal(solve('WBBWWBBWBW', 7), 3)
  assert.equal(solve('WBWBBBW', 2), 0)
})

test('2379 a single block window', () => {
  assert.equal(solve('WWW', 1), 1)
})

test('2379 rejects a letter other than W or B', () => {
  assert.throws(() => parseInput('{"blocks":"WBX","k":1}'))
})

// Independent oracle: count the white blocks inside every window directly.
function oracle(blocks, k) {
  let best = Infinity
  for (let start = 0; start + k <= blocks.length; start++) {
    let whites = 0
    for (let i = start; i < start + k; i++) if (blocks[i] === 'W') whites++
    best = Math.min(best, whites)
  }
  return best
}

test('2379 random strings match a per-window oracle', () => {
  let seed = 2379
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(16)
    let blocks = ''
    for (let i = 0; i < len; i++) blocks += rnd(2) ? 'W' : 'B'
    const k = 1 + rnd(len)
    assert.equal(solve(blocks, k), oracle(blocks, k), `${blocks} ${k}`)
  }
})
