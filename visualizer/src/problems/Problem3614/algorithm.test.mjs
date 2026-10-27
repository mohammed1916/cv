import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('3614 worked examples', () => {
  assert.equal(solve('{"s":"cd%*#","k":2}'), '.')
  assert.equal(solve('{"s":"ab#","k":3}'), 'b')
  assert.equal(solve('{"s":"ab#*","k":1}'), 'b')
})

test('3614 rejects a character outside the allowed set', () => {
  assert.throws(() => parseInput('{"s":"aB","k":0}'))
})

// Independent oracle: build the processed string directly, then index it (a dot when k is past the end).
function oracle({ s, k }) {
  let text = ''
  for (const ch of s) {
    if (ch === '*') text = text.slice(0, -1)
    else if (ch === '#') text += text
    else if (ch === '%') text = [...text].reverse().join('')
    else text += ch
  }
  return k < text.length ? text[k] : '.'
}

test('3614 seeded random programs match the built-string oracle', () => {
  let seed = 3614
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  let checked = 0
  for (let t = 0; t < 300; t++) {
    let s = ''
    for (let i = 0; i < 1 + rnd(12); i++) s += 'ab*#%'[rnd(5)]
    const input = { s, k: rnd(20) }
    const text = JSON.stringify(input)
    try { parseInput(text) } catch { continue }
    checked += 1
    assert.equal(solve(text), oracle(input), text)
  }
  assert.ok(checked > 100)
})
