import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Oracle: generate every string reachable from `word` by extending a maximal group to size >= 3.
function reachable(word, maxLen) {
  const seen = new Set([word]), q = [word]
  while (q.length) {
    const t = q.pop()
    for (let i = 0; i < t.length;) {
      let j = i; while (j < t.length && t[j] === t[i]) j++
      const size = j - i
      for (let ns = Math.max(3, size + 1); t.length - size + ns <= maxLen; ns++) {
        const u = t.slice(0, i) + t[i].repeat(ns) + t.slice(j)
        if (!seen.has(u)) { seen.add(u); q.push(u) }
      }
      i = j
    }
  }
  return seen
}
test('official examples', () => {
  assert.equal(buildTrace(parseInput('{"s":"heeellooo","words":["hello","hi","helo"]}')).result, 1)
  assert.equal(buildTrace(parseInput('{"s":"zzzzzyyyyy","words":["zzyy","zy","zyy"]}')).result, 3)
})
test('random vs extension BFS', () => {
  let seed = 9
  const rnd = m => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) % m
  const str = () => Array.from({ length: 1 + rnd(7) }, () => 'ab'[rnd(2)]).join('')
  for (let t = 0; t < 300; t++) {
    const s = str(), words = Array.from({ length: 1 + rnd(4) }, str)
    const run = buildTrace({ s, words })
    assert.equal(run.result, words.filter(w => reachable(w, s.length).has(s)).length, `${s} ${words}`)
    assert.equal(run.frames.at(-1).phase, 'done')
  }
})
test('rejects bad input', () => {
  assert.throws(() => parseInput('{"s":"A","words":["a"]}'))
  assert.throws(() => parseInput('{"s":"a","words":[]}'))
  assert.throws(() => parseInput('[]'))
})
