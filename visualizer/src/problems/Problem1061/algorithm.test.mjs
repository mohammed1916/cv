import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s1, s2, baseStr) => buildTrace(parseInput(JSON.stringify({ s1, s2, baseStr }))).result

test('1061 official examples', () => {
  assert.equal(solve('parker', 'morris', 'parser'), 'makkek')
  assert.equal(solve('hello', 'world', 'hold'), 'hdld')
})

test('1061 equivalence is transitive', () => {
  // a~b and b~c make a, b, c one group whose representative is a.
  assert.equal(solve('ab', 'bc', 'cba'), 'aaa')
})

test('1061 rejects strings of different lengths', () => {
  assert.throws(() => parseInput('{"s1":"ab","s2":"a","baseStr":"a"}'))
})

// Independent oracle: build the letter graph, then give each letter the smallest letter reachable from it by breadth-first search.
function oracle(s1, s2, baseStr) {
  const adj = Array.from({ length: 26 }, () => [])
  for (let i = 0; i < s1.length; i++) {
    const a = s1.charCodeAt(i) - 97
    const b = s2.charCodeAt(i) - 97
    adj[a].push(b)
    adj[b].push(a)
  }
  const best = Array.from({ length: 26 }, (_, start) => {
    const seen = new Set([start])
    const queue = [start]
    while (queue.length) {
      const cur = queue.shift()
      for (const nxt of adj[cur]) if (!seen.has(nxt)) { seen.add(nxt); queue.push(nxt) }
    }
    return String.fromCharCode(97 + Math.min(...seen))
  })
  return [...baseStr].map(c => best[c.charCodeAt(0) - 97]).join('')
}

test('1061 random inputs match a graph-search oracle', () => {
  let seed = 1061
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const letters = 'abcdefgh'
  const pick = () => letters[rnd(letters.length)]
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(8)
    const s1 = Array.from({ length: len }, pick).join('')
    const s2 = Array.from({ length: len }, pick).join('')
    const baseStr = Array.from({ length: 1 + rnd(10) }, pick).join('')
    assert.equal(solve(s1, s2, baseStr), oracle(s1, s2, baseStr), JSON.stringify({ s1, s2, baseStr }))
  }
})
