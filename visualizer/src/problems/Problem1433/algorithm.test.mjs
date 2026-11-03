import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (first, second) => buildTrace({ first, second }).result

test('1433 sample pairs give the expected answers', () => {
  assert.equal(solve('abc', 'xya'), true)
  assert.equal(solve('abe', 'acd'), false)
  assert.equal(solve('leetcodee', 'interview'), true)
  assert.equal(solve('ab', 'ba'), true)
})

test('1433 identical strings can break each other', () => {
  assert.equal(solve('mno', 'mno'), true)
})

test('1433 rejects malformed input', () => {
  assert.throws(() => parseInput('["ab","cd"]'), /object/)
  assert.throws(() => parseInput('{"first":"AB","second":"cd"}'), /lowercase/)
  assert.throws(() => parseInput('{"first":"abc","second":"de"}'), /equal length/)
})

// Independent oracle: try every rearrangement of each string (lengths up to 6) and test dominance directly.
function permutations(s) {
  if (s.length <= 1) return [s]
  const out = []
  for (let i = 0; i < s.length; i++) {
    for (const rest of permutations(s.slice(0, i) + s.slice(i + 1))) out.push(s[i] + rest)
  }
  return out
}
const dominates = (p, q) => [...p].every((ch, i) => ch >= q[i])

test('1433 random pairs match a permutation oracle', () => {
  let seed = 17
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const len = 1 + rnd(6)
    const word = () => Array.from({ length: len }, () => String.fromCharCode(97 + rnd(5))).join('')
    const first = word()
    const second = word()
    const expected = permutations(first).some(p => permutations(second).some(q => dominates(p, q)))
      || permutations(second).some(q => permutations(first).some(p => dominates(q, p)))
    parseInput(JSON.stringify({ first, second }))
    assert.equal(solve(first, second), expected, `${first} ${second}`)
  }
})
