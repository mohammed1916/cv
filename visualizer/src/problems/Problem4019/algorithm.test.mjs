import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, k) => buildTrace({ s, k }).result

test('4019 hand-checked strings', () => {
  assert.equal(solve('aab', 1), 'ab')
  assert.equal(solve('abca', 3), 'abc')
  assert.equal(solve('xyzxy', 2), 'xyzxy')
  assert.equal(solve('aaaa', 1), 'a')
  assert.equal(solve('banana', 2), 'ban')
})

test('4019 rejects bad input', () => {
  assert.throws(() => parseInput('{"s":"ab","k":0}'))
  assert.throws(() => parseInput('{"s":"A","k":1}'))
})

// Oracle: keep the string as an array and try every ordered pair with a fresh loop each round.
function oracle(s, k) {
  let chars = [...s]
  for (;;) {
    let hit = null
    const pairs = []
    for (let a = 0; a < chars.length; a++) for (let b = a + 1; b < chars.length; b++) pairs.push([a, b])
    pairs.sort((x, y) => x[0] - y[0] || x[1] - y[1])
    for (const [a, b] of pairs) {
      if (b - a <= k && chars[a] === chars[b]) { hit = b; break }
    }
    if (hit === null) return chars.join('')
    chars = chars.filter((_, index) => index !== hit)
  }
}

test('4019 random strings match the array oracle and frames stay consistent', () => {
  let seed = 4019
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(9)
    const s = Array.from({ length: len }, () => 'abc'[rnd(3)]).join('')
    const k = 1 + rnd(4)
    const run = buildTrace({ s, k })
    assert.equal(run.result, oracle(s, k), JSON.stringify({ s, k }))
    assert.equal(run.frames.at(-1).phase, 'done')
    assert.equal(run.frames.at(-1).s, run.result)
  }
})
