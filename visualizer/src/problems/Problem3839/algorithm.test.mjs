import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, solve } from './algorithm.js'

// Brute force: join words into components when they share the first k letters (union find over pairs).
function brute({ words, k }) {
  const parent = words.map((_, i) => i)
  const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  const ok = w => w.length >= k
  for (let i = 0; i < words.length; i++) for (let j = i + 1; j < words.length; j++) {
    if (ok(words[i]) && ok(words[j]) && words[i].slice(0, k) === words[j].slice(0, k)) parent[find(i)] = find(j)
  }
  const sizes = new Map()
  words.forEach((w, i) => { if (ok(w)) sizes.set(find(i), (sizes.get(find(i)) || 0) + 1) })
  return [...sizes.values()].filter(c => c >= 2).length
}

test('3839 worked cases', () => {
  assert.equal(solve({ words: ['apple', 'apply', 'banana', 'bandit'], k: 2 }), 2)
  assert.equal(solve({ words: ['car', 'cat', 'cartoon'], k: 3 }), 1)
  assert.equal(solve({ words: ['bat', 'dog', 'dog', 'doggy', 'bat'], k: 3 }), 2)
})

test('3839 matches a union-find brute force', () => {
  const cases = [
    { words: ['ab', 'ac', 'ad', 'b', 'ba'], k: 1 },
    { words: ['abc', 'abd', 'x', 'xyz', 'xy'], k: 2 },
    { words: ['q', 'qq', 'qqq', 'qqqq'], k: 3 },
  ]
  for (const input of cases) assert.equal(solve(input), brute(input))
})

test('3839 every frame names a Python and pseudocode line', () => {
  for (const frame of buildTrace({ words: ['ab', 'a', 'ac'], k: 2 }).frames) assert.ok(frame.pythonLine > 0 && frame.activeLine > 0)
})

test('3839 rejects k of zero', () => {
  assert.throws(() => parseInput('{"words":["ab"],"k":0}'))
})
