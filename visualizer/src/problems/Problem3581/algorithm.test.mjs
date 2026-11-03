import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('3581 single digits and small numbers', () => {
  // "one": o, n, e each appear once, so three letters are odd.
  assert.equal(solve('1'), 3)
  // "onezero": o and e appear twice; n, z and r appear once.
  assert.equal(solve('10'), 3)
  assert.equal(solve('0'), 4)
})

test('3581 rejects leading zeros and non-digits', () => {
  assert.throws(() => parseInput('01'))
  assert.throws(() => parseInput('12a'))
  assert.throws(() => parseInput(''))
})

// Independent check: spell the whole number and count each letter directly.
function oracle(num) {
  const names = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
  const text = [...String(num)].map(d => names[Number(d)]).join('')
  const counts = new Map()
  for (const ch of text) counts.set(ch, (counts.get(ch) ?? 0) + 1)
  return [...counts.values()].filter(c => c % 2 === 1).length
}

test('3581 random numbers match a direct letter count', () => {
  let seed = 3581
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 300; t++) {
    const num = rnd(1000000000)
    const text = String(num)
    if (text.length > 1 && text[0] === '0') continue
    assert.equal(solve(text), oracle(num), text)
  }
})

test('3581 frames keep their pseudocode and python lines in range', () => {
  const run = buildTrace(parseInput('4096'))
  for (const f of run.frames) {
    assert.ok(f.activeLine >= 1 && f.activeLine <= 8)
    assert.ok(f.pythonLine >= 1)
    assert.equal(f.odd.length, 26)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
