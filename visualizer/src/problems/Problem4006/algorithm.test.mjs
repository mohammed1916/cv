import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = s => buildTrace({ s }).result

test('4006 small hand cases', () => {
  assert.equal(solve('0'), 1)
  assert.equal(solve('1010'), 4)
  assert.equal(solve('111'), 1)
  assert.equal(solve('1011000'), 6)
})

test('4006 rejects non-binary input', () => {
  assert.throws(() => parseInput('{"s":""}'))
  assert.throws(() => parseInput('{"s":"012"}'))
})

// Brute oracle: a prefix can be rearranged into alternating bits exactly when some permutation alternates.
function alternatingArrangementExists(chars) {
  const perm = (rest, prefix) => {
    if (rest.length === 0) {
      for (let i = 1; i < prefix.length; i++) if (prefix[i] === prefix[i - 1]) return false
      return true
    }
    return rest.some((c, i) => perm([...rest.slice(0, i), ...rest.slice(i + 1)], [...prefix, c]))
  }
  return perm(chars, [])
}

test('4006 matches a permutation check on every prefix', () => {
  let seed = 4006
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const len = 1 + rnd(7)
    const s = Array.from({ length: len }, () => (rnd(2) ? '1' : '0')).join('')
    let expected = 0
    for (let i = 1; i <= s.length; i++) if (alternatingArrangementExists(s.slice(0, i).split(''))) expected++
    assert.equal(solve(s), expected, s)
  }
})

test('4006 frames reference valid pseudocode and python lines', () => {
  const run = buildTrace({ s: '1011000' })
  const pyLines = python.split('\n').length
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines)
    assert.ok(f.count <= f.ones + f.zeros)
  }
})
