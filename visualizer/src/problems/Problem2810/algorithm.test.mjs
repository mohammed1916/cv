import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2810 official examples', () => {
  assert.equal(solve('{"s":"string"}'), 'rtsng')
  assert.equal(solve('{"s":"poiinter"}'), 'ponter')
})

test('2810 rejects an uppercase letter', () => {
  assert.throws(() => parseInput('{"s":"Abc"}'))
})

// Independent oracle: keep the text in a prefix P and a reversed flag R instead of the actual string.
// Appending while reversed prepends to P; an i only flips R.
function oracle({ s }) {
  let P = ''
  let R = false
  for (const ch of s) {
    if (ch === 'i') R = !R
    else P = R ? ch + P : P + ch
  }
  return R ? [...P].reverse().join('') : P
}

test('2810 seeded random strings match a flag-based oracle', () => {
  let seed = 2810
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    let s = ''
    for (let i = 0; i < 1 + rnd(30); i++) s += 'abi'[rnd(3)]
    assert.equal(solve(JSON.stringify({ s })), oracle({ s }), s)
  }
})
