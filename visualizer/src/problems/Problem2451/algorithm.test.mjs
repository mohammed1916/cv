import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = words => buildTrace({ words }).result
const PY_LINES = python.split('\n').length

test('2451 worked examples', () => {
  assert.equal(solve(['adc', 'wzy', 'abc']), 'abc')
  assert.equal(solve(['aaa', 'bob', 'ccc', 'ddd']), 'bob')
})

test('2451 frames point at real python lines', () => {
  const { frames } = buildTrace({ words: ['adc', 'wzy', 'abc'] })
  for (const f of frames) assert.ok(f.pythonLine >= 1 && f.pythonLine <= PY_LINES && python.split('\n')[f.pythonLine - 1].trim() !== '')
})

test('2451 rejects invalid input', () => {
  assert.throws(() => parseInput('{"words":["ab","cd"]}'))
  assert.throws(() => parseInput('{"words":["ab","cde","fg"]}'))
  assert.throws(() => parseInput('{"words":["ab","cd","ef"]}'))
})

// Oracle: the answer is the word whose pattern occurs exactly once.
function oracle(words) {
  const pattern = w => w.split('').slice(1).map((c, i) => c.charCodeAt(0) - w.charCodeAt(i)).join(',')
  return words.find(w => words.filter(x => pattern(x) === pattern(w)).length === 1)
}

test('2451 random valid inputs match a brute-force oracle', () => {
  let seed = 2451
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  // Build a word from a fixed difference pattern and a start letter; null when it leaves a to z.
  const fromPattern = (diffs, start) => {
    let c = start
    const out = [c]
    for (const d of diffs) { c += d; if (c < 0 || c > 25) return null; out.push(c) }
    return out.map(x => String.fromCharCode(97 + x)).join('')
  }
  let checked = 0
  for (let t = 0; t < 300; t++) {
    const len = 2 + rnd(4)
    const diffs = Array.from({ length: len - 1 }, () => rnd(5) - 2)
    const other = Array.from({ length: len - 1 }, () => rnd(5) - 2)
    if (other.join() === diffs.join()) continue
    const copies = 2 + rnd(3)
    const words = []
    for (let k = 0; k < copies; k++) { const w = fromPattern(diffs, rnd(26)); if (w) words.push(w) }
    const odd = fromPattern(other, rnd(26))
    if (!odd || words.length < 2) continue
    words.push(odd)
    words.sort(() => rnd(3) - 1)
    try { parseInput(JSON.stringify({ words })) } catch { continue }
    checked++
    assert.equal(solve(words), oracle(words), JSON.stringify(words))
  }
  assert.ok(checked > 20)
})
