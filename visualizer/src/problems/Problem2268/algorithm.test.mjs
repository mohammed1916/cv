import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2268 worked examples', () => {
  assert.equal(solve('apple'), 5)
  assert.equal(solve('abcdefghijklmnopqrstuvwxyz'), 51)
  assert.equal(solve('aaaabbc'), 7)
  assert.equal(solve('a'), 1)
})

test('2268 rejects invalid input', () => {
  assert.throws(() => parseInput(''))
  assert.throws(() => parseInput('Abc'))
  assert.throws(() => parseInput('a'.repeat(27)))
})

// Oracle: try every injective placement of the distinct letters onto the 27 slots.
function oracle(word) {
  const counts = new Map()
  for (const ch of word) counts.set(ch, (counts.get(ch) || 0) + 1)
  const letters = [...counts.keys()]
  let best = Infinity
  const used = new Set()
  const go = (i, cost) => {
    if (cost >= best) return
    if (i === letters.length) { best = cost; return }
    for (let slot = 0; slot < 27; slot++) {
      if (used.has(slot)) continue
      used.add(slot)
      go(i + 1, cost + counts.get(letters[i]) * (Math.floor(slot / 9) + 1))
      used.delete(slot)
    }
  }
  go(0, 0)
  return best
}

test('2268 random words match a slot-assignment oracle', () => {
  let seed = 2268
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 60; t++) {
    const letters = 'abcdefghi'
    const word = Array.from({ length: 1 + rnd(6) }, () => letters[rnd(4 + rnd(5))]).join('')
    const distinct = new Set(word).size
    if (distinct > 4) continue
    assert.equal(solve(word), oracle(word), word)
  }
})

test('2268 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('apple')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
