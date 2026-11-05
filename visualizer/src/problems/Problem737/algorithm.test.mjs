import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

function oracle(sentence1, sentence2, pairs) {
  if (sentence1.length !== sentence2.length) return false
  const graph = new Map()
  const link = (a, b) => { if (!graph.has(a)) graph.set(a, new Set()); graph.get(a).add(b) }
  for (const [a, b] of pairs) { link(a, b); link(b, a) }
  return sentence1.every((a, i) => {
    const b = sentence2[i]
    if (a === b) return true
    const seen = new Set([a]), queue = [a]
    while (queue.length) {
      const w = queue.shift()
      for (const next of graph.get(w) ?? []) if (!seen.has(next)) { seen.add(next); queue.push(next) }
    }
    return seen.has(b)
  })
}

test('737 worked examples', () => {
  assert.equal(buildTrace({ sentence1: ['cat', 'sees', 'fish'], sentence2: ['dog', 'notices', 'shark'], pairs: [['cat', 'dog'], ['sees', 'notices'], ['fish', 'shark']] }).result, true)
  assert.equal(buildTrace({ sentence1: ['red', 'car'], sentence2: ['blue', 'car'], pairs: [['red', 'green']] }).result, false)
})

test('737 random small sentences match a breadth-first oracle', () => {
  let state = 737
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  const words = ['a', 'b', 'c', 'd', 'e']
  for (let t = 0; t < 1500; t++) {
    const n = rand(4)
    const s1 = Array.from({ length: n }, () => words[rand(5)])
    const s2 = Array.from({ length: n }, () => words[rand(5)])
    const pairs = Array.from({ length: rand(5) }, () => [words[rand(5)], words[rand(5)]])
    assert.equal(buildTrace({ sentence1: s1, sentence2: s2, pairs }).result, oracle(s1, s2, pairs), JSON.stringify({ s1, s2, pairs }))
  }
})

test('737 rejects non-lowercase words', () => {
  assert.throws(() => parseInput('{"sentence1":["Cat"],"sentence2":["cat"],"pairs":[]}'))
})
