import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (source, target, rules) => buildTrace({ source, target, rules }).result

function checkFrames(run) {
  const lines = python.trim().split('\n').length
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, 'activeLine in range')
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= lines, 'pythonLine in range')
    assert.equal(typeof f.message, 'string')
  }
}

// Brute force: try every set of disjoint windows, each with a rule that fits.
function brute(source, target, rules) {
  const n = source.length
  const best = (i) => {
    if (i === n) return 0
    let result = source[i] === target[i] ? best(i + 1) : Infinity
    for (const r of rules) {
      const len = r.pattern.length
      if (i + len > n) continue
      const fits = [...r.pattern].every((p, j) => p === '*' || p === source[i + j])
      if (fits && r.replacement === target.slice(i, i + len)) {
        const sub = best(i + len)
        if (sub !== Infinity) result = Math.min(result, r.cost + [...r.pattern].filter(c => c === '*').length + sub)
      }
    }
    return result
  }
  const value = best(0)
  return value === Infinity ? -1 : value
}

test('3995 authored examples', () => {
  assert.equal(solve('abcd', 'xyzd', [{ pattern: 'a*', replacement: 'xy', cost: 2 }, { pattern: 'c', replacement: 'z', cost: 1 }]), 4)
  assert.equal(solve('aaa', 'xyz', [{ pattern: 'a', replacement: 'x', cost: 1 }, { pattern: 'a*', replacement: 'yz', cost: 2 }]), 4)
  assert.equal(solve('ab', 'ba', [{ pattern: 'a', replacement: 'b', cost: 1 }]), -1)
})

test('3995 windows cannot overlap', () => {
  // One two-letter rule must not be applied twice across three letters.
  assert.equal(solve('aaa', 'bbb', [{ pattern: 'aa', replacement: 'bb', cost: 1 }]), -1)
})

test('3995 rejects malformed rules', () => {
  const base = '{"source":"ab","target":"cd","rules":%s}'
  assert.throws(() => parseInput(base.replace('%s', '[{"pattern":"a","replacement":"cd","cost":1}]')))
  assert.throws(() => parseInput(base.replace('%s', '[{"pattern":"*","replacement":"c","cost":1}]')))
  assert.throws(() => parseInput(base.replace('%s', '[{"pattern":"a","replacement":"c","cost":0}]')))
})

test('3995 random inputs match an exhaustive window search', () => {
  let seed = 3995
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const letters = 'abc'
  const word = len => Array.from({ length: len }, () => letters[rnd(3)]).join('')
  for (let t = 0; t < 250; t++) {
    const n = 1 + rnd(6)
    const source = word(n)
    const target = word(n)
    const rules = Array.from({ length: rnd(4) }, () => {
      const len = 1 + rnd(3)
      let pattern = ''
      for (let j = 0; j < len; j++) pattern += rnd(4) === 0 && j > 0 ? '*' : letters[rnd(3)]
      if (!/[a-c]/.test(pattern)) pattern = letters[rnd(3)] + pattern.slice(1)
      return { pattern, replacement: word(len), cost: 1 + rnd(4) }
    })
    const run = buildTrace({ source, target, rules })
    assert.equal(run.result, brute(source, target, rules), JSON.stringify({ source, target, rules }))
    checkFrames(run)
  }
})
