import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (s, patterns) => buildTrace({ s, patterns }).result

function checkFrames(run) {
  const lines = python.trim().split('\n').length
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, 'activeLine in range')
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= lines, 'pythonLine in range')
    assert.equal(typeof f.message, 'string')
  }
}

// Oracle: BFS over every binary string reachable by sorting subsequences, then match each pattern.
function reachableSet(s) {
  const n = s.length
  const seen = new Set([s])
  const queue = [s]
  while (queue.length) {
    const cur = queue.shift()
    for (let mask = 1; mask < 1 << n; mask++) {
      const idx = []
      for (let i = 0; i < n; i++) if (mask & (1 << i)) idx.push(i)
      const vals = idx.map(i => cur[i]).sort()
      const arr = cur.split('')
      idx.forEach((pos, k) => { arr[pos] = vals[k] })
      const next = arr.join('')
      if (!seen.has(next)) { seen.add(next); queue.push(next) }
    }
  }
  return seen
}

const matches = (str, pattern) => [...pattern].every((p, i) => p === '?' || p === str[i])

test('3998 authored examples', () => {
  assert.deepEqual(solve('1010', ['0?1?', '11??', '??0?']), [true, false, true])
  assert.deepEqual(solve('0000', ['1111', '0?0?']), [false, true])
})

test('3998 a sorted string reaches only itself', () => {
  assert.deepEqual(solve('0011', ['0011', '0?11', '1???']), [true, true, false])
})

test('3998 rejects malformed input', () => {
  assert.throws(() => parseInput('{"s":"10","patterns":["1x"]}'))
  assert.throws(() => parseInput('{"s":"10","patterns":["111"]}'))
})

test('3998 small strings match a reachability search', () => {
  let seed = 3998
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const bits = len => Array.from({ length: len }, () => (rnd(2) ? '1' : '0')).join('')
  for (let t = 0; t < 60; t++) {
    const n = 1 + rnd(6)
    const s = bits(n)
    const reach = [...reachableSet(s)]
    const patterns = Array.from({ length: 1 + rnd(4) }, () => Array.from({ length: n }, () => ['0', '1', '?'][rnd(3)]).join(''))
    const expected = patterns.map(p => reach.some(str => matches(str, p)))
    const run = buildTrace({ s, patterns })
    assert.deepEqual(run.result, expected, JSON.stringify({ s, patterns }))
    checkFrames(run)
  }
})
