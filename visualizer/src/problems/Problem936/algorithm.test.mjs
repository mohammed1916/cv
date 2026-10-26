import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (stamp, target) => buildTrace(parseInput(JSON.stringify({ stamp, target }))).result
function apply(stamp, target, moves) {
  const s = Array(target.length).fill('?')
  for (const i of moves) { if (i < 0 || i + stamp.length > target.length) return false; for (let k = 0; k < stamp.length; k++) s[i + k] = stamp[k] }
  return s.join('') === target
}
// Oracle: forward BFS over all stamp states ('.' = unstamped).
function reachable(stamp, target) {
  const n = target.length, start = '.'.repeat(n), seen = new Set([start]), q = [start]
  while (q.length) {
    const cur = q.shift()
    if (cur === target) return true
    for (let i = 0; i + stamp.length <= n; i++) {
      const nx = cur.slice(0, i) + stamp + cur.slice(i + stamp.length)
      if (!seen.has(nx)) { seen.add(nx); q.push(nx) }
    }
  }
  return false
}
test('official examples', () => {
  assert.ok(apply('abc', 'ababc', solve('abc', 'ababc')))
  assert.ok(apply('abca', 'aabcaca', solve('abca', 'aabcaca')))
})
test('random small cases agree with forward BFS', () => {
  let seed = 3; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff
  const str = len => Array.from({ length: len }, () => 'ab'[Math.floor(rnd() * 2)]).join('')
  for (let t = 0; t < 400; t++) {
    const n = 1 + Math.floor(rnd() * 6), m = 1 + Math.floor(rnd() * n)
    const stamp = str(m), target = str(n)
    const moves = solve(stamp, target)
    if (reachable(stamp, target)) { assert.ok(apply(stamp, target, moves) && moves.length <= 10 * n, `${stamp} ${target}`) }
    else assert.deepEqual(moves, [], `${stamp} ${target}`)
  }
})
test('rejects bad input', () => {
  for (const bad of ['{"stamp":"abc"}', '{"stamp":"abcd","target":"ab"}', '{"stamp":"A","target":"A"}', '[1]', '{"stamp":"","target":"a"}'])
    assert.throws(() => parseInput(bad))
})
