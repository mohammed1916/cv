import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = (s, pairs) => buildTrace({ s, pairs }).result

test('1202 sample walkthroughs', () => {
  assert.equal(solve('cedar', []), 'cedar')
  assert.equal(solve('moss', [[0, 1], [1, 2], [2, 3]]), 'moss')
  assert.equal(solve('oak', [[0, 2], [0, 2]]), 'kao')
  assert.equal(solve('cba', [[0, 1], [1, 2]]), 'abc')
})

// Independent oracle: breadth-first search over every string reachable by applying allowed swaps.
function oracle(s, pairs) {
  const seen = new Set([s])
  const queue = [s]
  while (queue.length) {
    const cur = queue.shift()
    for (const [i, j] of pairs) {
      const chars = cur.split('')
      ;[chars[i], chars[j]] = [chars[j], chars[i]]
      const next = chars.join('')
      if (!seen.has(next)) { seen.add(next); queue.push(next) }
    }
  }
  return [...seen].sort()[0]
}

let seed = 1202
const rand = n => { seed = (seed * 1664525 + 1013904223) % 4294967296; return Math.floor(seed / 65536) % n }

test('1202 small random cases match the reachable-string oracle', () => {
  for (let trial = 0; trial < 300; trial++) {
    const n = 1 + rand(6)
    let s = ''
    for (let i = 0; i < n; i++) s += 'abcde'[rand(5)]
    const pairs = Array.from({ length: rand(6) }, () => [rand(n), rand(n)])
    assert.equal(solve(s, pairs), oracle(s, pairs), JSON.stringify({ s, pairs }))
  }
})

test('1202 trace shows separation, unions, component sorts and the final string', () => {
  const { frames, result } = buildTrace({ s: 'dcba', pairs: [[0, 3], [1, 2]] })
  assert.equal(frames[0].phase, 'start')
  assert.equal(frames.at(-1).phase, 'done')
  assert.equal(result, 'abcd')
  assert.equal(frames.filter(f => f.phase === 'inspect').length, 2)
  assert.ok(frames.every(f => f.snapshot && typeof f.message === 'string'))
})

test('1202 phases and code are exported for the shared shell', () => {
  assert.deepEqual(phases.map(p => p.id), ['start', 'inspect', 'update', 'done'])
  assert.equal(code.length, 6)
  assert.ok(python.includes('smallest_string_with_swaps'))
})

test('1202 rejects bad input', () => {
  assert.throws(() => parseInput('{"s":"AB","pairs":[]}'), /lowercase/)
  assert.throws(() => parseInput('{"s":"ab","pairs":[[0,2]]}'), /from 0 to 1/)
  assert.throws(() => parseInput('{"s":"ab"}'), /pairs array/)
})
