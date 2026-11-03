import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (text, replacements) => buildTrace({ text, replacements: replacements.map(p => [...p]) }).result

test('3481 worked presets', () => {
  assert.equal(solve('a%bc%d', [['bc', 'x%y%'], ['y', 'zz']]), 'axzzd')
  assert.equal(solve('%q%-%q%', [['q', 'ab']]), 'ab-ab')
  assert.equal(solve('nothing here', [['k', 'v']]), 'nothing here')
})

test('3481 edge cases', () => {
  assert.equal(solve('%a%', [['a', 'b']]), 'b')
  assert.equal(solve('%a%%a%', [['a', 'b']]), 'bb')
  assert.equal(solve('x', [['k', 'v']]), 'x')
})

test('3481 rejects malformed or cyclic input', () => {
  assert.throws(() => parseInput('{"text":"a%b","replacements":[["b","c"]]}'))
  assert.throws(() => parseInput('{"text":"%z%","replacements":[["b","c"]]}'))
  assert.throws(() => parseInput('{"text":"%a%","replacements":[["a","%b%"],["b","%a%"]]}'))
  assert.throws(() => parseInput('{"text":"%a%","replacements":[["a","x"],["a","y"]]}'))
})

// Oracle: replace every reference in every pass until none remain.
function oracle(text, replacements) {
  const map = new Map(replacements)
  let s = text
  while (s.includes('%')) s = s.replace(/%([a-z]{1,3})%/g, (_, key) => map.get(key))
  return s
}

test('3481 random acyclic inputs match a repeated-replacement oracle', () => {
  let seed = 3481
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const allKeys = ['a', 'b', 'c', 'd']
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(4)
    const keys = allKeys.slice(0, m)
    // Key i may only reference keys with a larger index, so the dependencies stay acyclic.
    const replacements = keys.map((key, i) => {
      let value = ''
      for (let k = 0; k < 1 + rnd(3); k++) {
        if (i < m - 1 && rnd(2) === 0) value += `%${keys[i + 1 + rnd(m - i - 1)]}%`
        else value += 'xyz'[rnd(3)]
      }
      return [key, value]
    })
    const text = Array.from({ length: 1 + rnd(4) }, () => (rnd(2) ? `%${keys[rnd(m)]}%` : 'q')).join('')
    const input = JSON.stringify({ text, replacements })
    assert.equal(solve(text, replacements), oracle(text, replacements), input)
  }
})

test('3481 frames keep pseudocode and python line references inside range', () => {
  const pyLines = python.trim().split('\n').length
  const run = buildTrace({ text: 'a%bc%d', replacements: [['bc', 'x%y%'], ['y', 'zz']] })
  assert.equal(run.frames.at(-1).phase, 'done')
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
  }
})
