import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: try every injective digit assignment, then check the words literally.
function oracle(words, result) {
  const letters = [...new Set([...words.join(''), ...result])]
  const leading = new Set([...words, result].filter(w => w.length > 1).map(w => w[0]))
  const value = (w, m) => Number([...w].map(c => m[c]).join(''))
  const used = new Set()
  const m = {}
  const go = i => {
    if (i === letters.length) return words.reduce((s, w) => s + value(w, m), 0) === value(result, m)
    for (let d = 0; d <= 9; d++) {
      if (used.has(d) || (d === 0 && leading.has(letters[i]))) continue
      m[letters[i]] = d; used.add(d)
      if (go(i + 1)) return true
      used.delete(d)
    }
    return false
  }
  return go(0)
}

test('sample BE + BE = ME is solvable', () => {
  assert.equal(buildTrace({ words: ['BE', 'BE'], result: 'ME' }).result, true)
})

test('unsolvable example matches the oracle', () => {
  assert.equal(buildTrace({ words: ['AB', 'AB'], result: 'CC' }).result, oracle(['AB', 'AB'], 'CC'))
})

test('small random puzzles agree with the literal oracle', () => {
  let state = 7
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  const pick = () => 'ABCDE'[rand(5)]
  for (let t = 0; t < 80; t++) {
    const words = Array.from({ length: 1 + rand(2) }, () => Array.from({ length: 1 + rand(3) }, pick).join(''))
    const result = Array.from({ length: 1 + rand(3) }, pick).join('')
    if (new Set([...words.join(''), ...result]).size > 5) continue
    assert.equal(buildTrace({ words, result }).result, oracle(words, result), JSON.stringify({ words, result }))
  }
})

test('every frame points at a real code line and a Python line', () => {
  for (const frame of buildTrace({ words: ['BE', 'BE'], result: 'ME' }).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= 11, frame.message)
    assert.ok(frame.pythonLine >= 1, frame.message)
    assert.ok(frame.message.length > 10)
  }
})

test('rejects malformed input', () => {
  assert.throws(() => parseInput('{"words":["ab"],"result":"C"}'), /words/)
  assert.throws(() => parseInput('{"words":["ABCD","EFGH"],"result":"IJKLM"}'), /different letters/)
})
