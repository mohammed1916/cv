import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = words => buildTrace({ words }).result

test('2746 official examples', () => {
  assert.equal(solve(['aa', 'ab', 'bc']), 4)
  assert.equal(solve(['ab', 'b']), 2)
  assert.equal(solve(['aaa', 'c', 'aba']), 6)
})

test('2746 single word and a joinable pair', () => {
  assert.equal(solve(['abc']), 3)
  assert.equal(solve(['a']), 1)
  // "a" then "a" joins to "a" (one letter removed), so the length is 1.
  assert.equal(solve(['a', 'a']), 1)
})

test('2746 rejects bad input', () => {
  assert.throws(() => parseInput('{"words": []}'), /1 to 8/)
  assert.throws(() => parseInput('{"words": ["ab", ""]}'), /1 to 6/)
  assert.throws(() => parseInput('{"words": ["AB"]}'), /lowercase/)
})

// Independent oracle: try every join order and both sides, building the full strings.
function oracle(words) {
  let best = Infinity
  const go = (cur, i) => {
    if (i === words.length) {
      best = Math.min(best, cur.length)
      return
    }
    const w = words[i]
    go(cur.at(-1) === w[0] ? cur + w.slice(1) : cur + w, i + 1)
    go(w.at(-1) === cur[0] ? w + cur.slice(1) : w + cur, i + 1)
  }
  go(words[0], 1)
  return best
}

test('2746 random word lists match a full-string oracle', () => {
  let seed = 2746
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const count = 1 + rnd(5)
    const words = []
    for (let i = 0; i < count; i++) {
      let w = ''
      const len = 1 + rnd(3)
      for (let k = 0; k < len; k++) w += 'ab'[rnd(2)]
      words.push(w)
    }
    assert.equal(solve(words), oracle(words), JSON.stringify(words))
  }
})
