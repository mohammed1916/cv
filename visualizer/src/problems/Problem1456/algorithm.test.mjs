import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (text, k) => buildTrace({ text, k }).result

test('1456 sample inputs return the expected maximum counts', () => {
  assert.equal(solve('aeiouxyz', 3), 3)
  assert.equal(solve('bcdfgaeb', 2), 2)
  assert.equal(solve('queueing', 4), 4)
  assert.equal(solve('xyz', 3), 0)
})

test('1456 window length equal to the text and length one are handled', () => {
  assert.equal(solve('aei', 3), 3)
  assert.equal(solve('bob', 1), 1)
  assert.equal(solve('bao', 1), 1)
})

test('1456 frames track the best window and end with a done frame', () => {
  const { frames, result } = buildTrace({ text: 'abcaei', k: 3 })
  assert.equal(result, 3)
  assert.equal(frames[0].phase, 'start')
  assert.equal(frames.at(-1).phase, 'done')
  assert.equal(frames.at(-1).snapshot.bestStart, 3)
})

test('1456 rejects malformed input', () => {
  assert.throws(() => parseInput('"abc"'), /object/)
  assert.throws(() => parseInput('{"text":"ABC","k":2}'), /text/)
  assert.throws(() => parseInput('{"text":"abc","k":0}'), /k/)
  assert.throws(() => parseInput('{"text":"abc","k":4}'), /k/)
})

// Independent oracle: check every length-k substring directly.
test('1456 random strings match a substring oracle', () => {
  let seed = 3
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const alphabet = 'aebcdo'
  for (let t = 0; t < 400; t++) {
    const len = 1 + rnd(14)
    const text = Array.from({ length: len }, () => alphabet[rnd(alphabet.length)]).join('')
    const k = 1 + rnd(len)
    let expected = 0
    for (let s = 0; s + k <= len; s++) {
      const c = [...text.slice(s, s + k)].filter(ch => 'aeiou'.includes(ch)).length
      expected = Math.max(expected, c)
    }
    assert.equal(solve(text, k), expected, `${text} ${k}`)
  }
})
