import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (alice, bob) => buildTrace(parseInput(JSON.stringify({ alice, bob }))).result

test('2868 Bob has no answer after the opening', () => {
  assert.equal(solve(['ab'], ['zz']), true)
  assert.equal(solve(['ab'], ['ac']), false)
})

test('2868 chains of neighbouring letters decide the game', () => {
  assert.equal(solve(['a', 'c'], ['b']), true)
  assert.equal(solve(['a', 'd'], ['b', 'e']), false)
  assert.equal(solve(['a', 'b', 'c'], ['b', 'c']), true)
})

test('2868 rejects malformed input', () => {
  assert.throws(() => parseInput('{"alice":[],"bob":["a"]}'))
  assert.throws(() => parseInput('{"alice":["Ab"],"bob":[]}'))
  assert.throws(() => parseInput('{"alice":["ab","ab"],"bob":[]}'))
})

// Oracle: plain minimax over the set of used words and the last word, with no monotonic shortcut.
function oracle(alice, bob) {
  const words = [...alice.map(w => ['alice', w]), ...bob.map(w => ['bob', w])]
  const first = (w) => w[0]
  const legal = (usedMask, last, mover) => {
    const out = []
    words.forEach(([owner, w], i) => {
      if (owner !== mover || (usedMask >> i) & 1) return
      if (last === null || (w > last && (first(w) === first(last) || first(w) === String.fromCharCode(first(last).charCodeAt(0) + 1)))) out.push(i)
    })
    return out
  }
  const memo = new Map()
  const wins = (usedMask, last, mover) => {
    const key = `${usedMask}|${last}|${mover}`
    if (memo.has(key)) return memo.get(key)
    let result = false
    for (const i of legal(usedMask, last, mover)) {
      if (!wins(usedMask | (1 << i), words[i][1], mover === 'alice' ? 'bob' : 'alice')) { result = true; break }
    }
    memo.set(key, result)
    return result
  }
  const opening = alice.reduce((a, b) => (a < b ? a : b))
  const openIndex = words.findIndex(([owner, w]) => owner === 'alice' && w === opening)
  return !wins(1 << openIndex, opening, 'bob')
}

test('2868 random small games match a used-set minimax oracle', () => {
  let seed = 2868
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const word = () => Array.from({ length: 1 + rnd(3) }, () => 'abcd'[rnd(4)]).join('')
  const distinct = n => [...new Set(Array.from({ length: n }, word))]
  for (let t = 0; t < 300; t++) {
    const alice = distinct(1 + rnd(4))
    const bob = distinct(rnd(4))
    assert.equal(solve(alice, bob), oracle(alice, bob), JSON.stringify({ alice, bob }))
  }
})

test('2868 every frame points at real pseudocode and python lines', () => {
  const run = buildTrace({ alice: ['ab', 'ca'], bob: ['ac', 'bd'] })
  const pyLines = python.trim().split('\n').length
  for (const f of run.frames) {
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLines)
    assert.equal(typeof f.message, 'string')
  }
})
