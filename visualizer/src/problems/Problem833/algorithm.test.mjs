import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
const solve = (s, indices, sources, targets) => buildTrace(parseInput(JSON.stringify({ s, indices, sources, targets }))).result
function oracle(s, indices, sources, targets) {
  const at = new Map(indices.map((idx, k) => [idx, k]))
  let out = ''
  for (let i = 0; i < s.length;) {
    const k = at.get(i)
    if (k !== undefined && s.startsWith(sources[k], i)) { out += targets[k]; i += sources[k].length } else out += s[i++]
  }
  return out
}
test('official examples', () => {
  assert.equal(solve('abcd', [0, 2], ['a', 'cd'], ['eee', 'ffff']), 'eeebffff')
  assert.equal(solve('abcd', [0, 2], ['ab', 'ec'], ['eee', 'ffff']), 'eeecd')
})
test('random non-overlapping operations match a left-to-right builder', () => {
  let seed = 21; const rnd = n => (seed = (seed * 1103515245 + 12345) % 2147483648) % n
  for (let t = 0; t < 400; t++) {
    const s = Array.from({ length: 4 + rnd(20) }, () => 'abc'[rnd(3)]).join('')
    const indices = [], sources = [], targets = []
    let pos = 0
    while (pos < s.length && indices.length < 8) {
      if (rnd(2)) {
        const len = 1 + rnd(Math.min(3, s.length - pos))
        indices.push(pos); sources.push(rnd(3) ? s.slice(pos, pos + len) : 'z'.repeat(len)); targets.push('xyz'.slice(0, 1 + rnd(3)))
        pos += len
      } else pos++
    }
    if (!indices.length) continue
    const perm = indices.map((_, i) => i).sort(() => rnd(3) - 1)
    const pick = a => perm.map(i => a[i])
    assert.equal(solve(s, pick(indices), pick(sources), pick(targets)), oracle(s, indices, sources, targets))
  }
})
test('invalid input rejected', () => {
  for (const bad of ['null', '{"s":"abc","indices":[5],"sources":["a"],"targets":["b"]}', '{"s":"abc","indices":[0,1],"sources":["ab","b"],"targets":["x","y"]}',
    '{"s":"abc","indices":[0],"sources":[],"targets":["b"]}', '{"s":"ABC","indices":[0],"sources":["a"],"targets":["b"]}']) assert.throws(() => parseInput(bad))
})
