import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, minRotation } from './algorithm.js'

const solve = words => buildTrace(words).result

function checkFrames(run) {
  const lines = python.trim().split('\n').length
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, 'activeLine in range')
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= lines, 'pythonLine in range')
    assert.equal(typeof f.message, 'string')
  }
}

// Oracle: closure of the rotation operations by BFS, then count distinct classes among the input words.
function oracleGroups(words) {
  const neighbours = w => {
    const even = [...w].filter((_, i) => i % 2 === 0)
    const odd = [...w].filter((_, i) => i % 2 === 1)
    const out = []
    const re = even.length ? [...even.slice(1), even[0]] : even
    const ro = odd.length ? [...odd.slice(1), odd[0]] : odd
    const build = (e, o) => { const arr = []; let a = 0, b = 0; for (let i = 0; i < w.length; i++) arr.push(i % 2 === 0 ? e[a++] : o[b++]); return arr.join('') }
    out.push(build(re, odd), build(even, ro))
    return out
  }
  const classOf = new Map()
  let id = 0
  for (const w of words) {
    if (classOf.has(w)) continue
    const queue = [w]
    classOf.set(w, id)
    while (queue.length) {
      const cur = queue.shift()
      for (const nxt of neighbours(cur)) {
        if (!classOf.has(nxt)) { classOf.set(nxt, id); queue.push(nxt) }
      }
    }
    id++
  }
  return new Set(words.map(w => classOf.get(w))).size
}

test('3999 authored examples', () => {
  assert.equal(solve(['abcd', 'cdab', 'abdc']), 2)
  assert.equal(solve(['a', 'z', 'ab', 'ba']), 4)
  assert.equal(solve(['abab', 'baba']), 2)
  assert.equal(solve(['abcd', 'cdab']), 1)
})

test('3999 minimum rotation returns the lexicographically smallest start', () => {
  for (const s of ['', 'a', 'ba', 'cabcab', 'aaaa', 'dcba']) {
    const r = minRotation(s).start
    const rotated = s.length ? s.slice(r) + s.slice(0, r) : ''
    for (let q = 0; q < Math.max(1, s.length); q++) {
      const other = s.length ? s.slice(q) + s.slice(0, q) : ''
      assert.ok(rotated <= other, `${s} at ${r} vs ${q}`)
    }
  }
})

test('3999 rejects bad words', () => {
  assert.throws(() => parseInput('["Ab"]'))
  assert.throws(() => parseInput('[""]'))
  assert.throws(() => parseInput('[]'))
})

test('3999 random word lists match a rotation-closure oracle', () => {
  let seed = 3999
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const word = len => Array.from({ length: len }, () => 'abc'[rnd(3)]).join('')
  for (let t = 0; t < 120; t++) {
    const count = 1 + rnd(6)
    const len = 1 + rnd(5)
    const words = Array.from({ length: count }, () => word(len))
    const run = buildTrace(words)
    assert.equal(run.result, oracleGroups(words), JSON.stringify(words))
    checkFrames(run)
  }
})
