import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (version1, version2) => buildTrace({ version1, version2 }).result

// Independent oracle: pad both dotted versions with zero parts to equal width, then compare fixed-width strings.
function oracle(a, b) {
  const pa = a.split('.').map(p => p.padStart(6, '0'))
  const pb = b.split('.').map(p => p.padStart(6, '0'))
  const width = Math.max(pa.length, pb.length)
  while (pa.length < width) pa.push('000000')
  while (pb.length < width) pb.push('000000')
  const x = pa.join('.')
  const y = pb.join('.')
  return x > y ? 1 : x < y ? -1 : 0
}

test('165 hand-checked comparisons', () => {
  assert.equal(solve('2.10.1', '2.9'), 1)
  assert.equal(solve('1.0', '1.0.0.0'), 0)
  assert.equal(solve('0.3', '0.10'), -1)
  assert.equal(solve('7', '7'), 0)
  assert.equal(solve('1.01', '1.1'), 0)
})

test('165 random versions match the padded-string oracle', () => {
  let seed = 9
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const randomVersion = () => Array.from({ length: 1 + rnd(4) }, () => String(rnd(30))).join('.')
  for (let t = 0; t < 400; t++) {
    const a = randomVersion()
    const b = randomVersion()
    assert.equal(solve(a, b), oracle(a, b), `${a} vs ${b}`)
  }
})

test('165 stops at the first unequal part', () => {
  const { frames } = buildTrace({ version1: '1.5.9', version2: '1.6.0' })
  const compares = frames.filter(f => f.phase === 'compare')
  assert.equal(compares.length, 2)
  assert.equal(frames.at(-1).phase, 'done')
})

test('165 rejects malformed versions', () => {
  assert.throws(() => parseInput('{"version1":"1..2","version2":"1"}'), /dots/)
  assert.throws(() => parseInput('{"version1":"1.a","version2":"1"}'), /dots/)
  assert.throws(() => parseInput('{"version1":"1234567","version2":"1"}'), /6 digits/)
  assert.throws(() => parseInput('[1]'), /object/)
})
