import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = path => buildTrace({ path }).result

test('1496 sample inputs return the expected answers', () => {
  assert.equal(solve('NESWW'), true)
  assert.equal(solve('NNEE'), false)
  assert.equal(solve('NSEE'), true)
  assert.equal(solve('W'), false)
})

test('1496 frames line up with pseudocode and Python', () => {
  assert.equal(python.split('\n').length, code.length)
  for (const frame of buildTrace({ path: 'NNSEW' }).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.equal(frame.pythonLine, frame.activeLine)
  }
})

test('1496 rejects malformed input', () => {
  assert.throws(() => parseInput('"NESW"'), /object/)
  assert.throws(() => parseInput('{"path":"NEXT"}'), /path/)
  assert.throws(() => parseInput('{"path":""}'), /path/)
})

test('1496 random walks match a brute-force position check', () => {
  let seed = 53
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const moves = 'NSEW'
  for (let t = 0; t < 300; t++) {
    const path = Array.from({ length: 1 + rnd(20) }, () => moves[rnd(4)]).join('')
    const deltas = { N: [0, 1], S: [0, -1], E: [1, 0], W: [-1, 0] }
    const seen = [[0, 0]]
    let x = 0
    let y = 0
    let expected = false
    for (const m of path) {
      x += deltas[m][0]
      y += deltas[m][1]
      if (seen.some(([a, b]) => a === x && b === y)) { expected = true; break }
      seen.push([x, y])
    }
    assert.equal(solve(path), expected, path)
  }
})
