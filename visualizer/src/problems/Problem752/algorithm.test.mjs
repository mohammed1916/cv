import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (deadends, target) => buildTrace(parseInput(JSON.stringify({ deadends, target }))).result
const nbrs = s => { const r = []; for (let i = 0; i < 4; i++) for (const d of [1, 9]) r.push(s.slice(0, i) + ((+s[i] + d) % 10) + s.slice(i + 1)); return r }
// Oracle: bidirectional BFS.
function bidi(deadends, target) {
  const dead = new Set(deadends)
  if (dead.has('0000')) return -1
  let a = new Set(['0000']), b = new Set([target]); const vis = new Set(['0000', target]); let steps = 0
  if (target === '0000') return 0
  while (a.size && b.size) {
    if (a.size > b.size) [a, b] = [b, a]
    const next = new Set()
    steps++
    for (const s of a) for (const n of nbrs(s)) {
      if (b.has(n)) return steps
      if (!dead.has(n) && !vis.has(n)) { vis.add(n); next.add(n) }
    }
    a = next
  }
  return -1
}
test('official examples', () => {
  assert.equal(solve(['0201', '0101', '0102', '1212', '2002'], '0202'), 6)
  assert.equal(solve(['8888'], '0009'), 1)
  assert.equal(solve(['8887', '8889', '8878', '8898', '8788', '8988', '7888', '9888'], '8888'), -1)
  assert.equal(solve(['0000'], '8888'), -1)
})
test('random instances vs bidirectional BFS', () => {
  let seed = 21
  const rnd = n => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) % n
  const word = () => String(rnd(10000)).padStart(4, '0')
  for (let t = 0; t < 40; t++) {
    const target = word()
    const deadends = Array.from({ length: rnd(300) }, word).filter(w => w !== target)
    assert.equal(solve(deadends, target), bidi(deadends, target))
  }
})
test('invalid input rejected', () => {
  assert.throws(() => parseInput('{"deadends": ["1"], "target": "0000"}'), /4-digit/)
  assert.throws(() => parseInput('{"deadends": ["1234"], "target": "1234"}'), /dead end/)
  assert.throws(() => parseInput('[]'), /Enter/)
})
