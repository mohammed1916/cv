import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const solve = (sentence, searchWord) => buildTrace({ sentence, searchWord }).result

test('1455 sample inputs return the expected one-based positions', () => {
  assert.equal(solve('keep the lantern lit tonight', 'lan'), 3)
  assert.equal(solve('plain cake and tea', 'te'), 4)
  assert.equal(solve('red blue green', 'pink'), -1)
})

test('1455 prefix must start at a word boundary and cannot be longer than the word', () => {
  assert.equal(solve('catalog cat', 'log'), -1)
  assert.equal(solve('ab abc', 'abcd'), -1)
  assert.equal(solve('abc', 'abc'), 1)
  assert.equal(solve('x y z', 'z'), 3)
})

test('1455 trace ends at the first match and reports every frame phase', () => {
  const { frames } = buildTrace({ sentence: 'one two three four', searchWord: 'th' })
  const ids = new Set(phases.map(p => p.id))
  assert.ok(frames.every(f => ids.has(f.phase)))
  assert.equal(frames.at(-1).phase, 'done')
  assert.equal(frames.at(-1).snapshot.answer, 3)
  assert.equal(frames.filter(f => f.phase === 'inspect').length, 3)
})

test('1455 rejects malformed input', () => {
  assert.throws(() => parseInput('["a"]'), /object/)
  assert.throws(() => parseInput('{"sentence":"a  b","searchWord":"a"}'), /sentence/)
  assert.throws(() => parseInput('{"sentence":"abc","searchWord":""}'), /searchWord/)
  assert.throws(() => parseInput('{"sentence":"abc","searchWord":"ABC"}'), /searchWord/)
})

// Independent oracle: split on spaces and compare with String.prototype.startsWith.
test('1455 random sentences match a direct oracle', () => {
  let seed = 11
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const letters = 'abc'
  for (let t = 0; t < 400; t++) {
    const count = 1 + rnd(6)
    const words = Array.from({ length: count }, () => Array.from({ length: 1 + rnd(4) }, () => letters[rnd(3)]).join(''))
    const sentence = words.join(' ')
    const searchWord = Array.from({ length: 1 + rnd(3) }, () => letters[rnd(3)]).join('')
    const idx = words.findIndex(w => w.startsWith(searchWord))
    assert.equal(solve(sentence, searchWord), idx === -1 ? -1 : idx + 1, `${sentence} / ${searchWord}`)
  }
})
