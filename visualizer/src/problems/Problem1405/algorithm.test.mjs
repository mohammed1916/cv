import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code } from './algorithm.js'

const solve = counts => buildTrace(counts).result

// Oracle: exhaustive memoised search over every legal next letter.
function maxLength(a, b, c) {
  const memo = new Map()
  const go = (x, y, z, last, run) => {
    const key = [x, y, z, last, run].join(',')
    if (memo.has(key)) return memo.get(key)
    let best = 0
    for (const [ch, count] of [['a', x], ['b', y], ['c', z]]) {
      if (count === 0) continue
      if (ch === last && run === 2) continue
      best = Math.max(best, 1 + go(ch === 'a' ? x - 1 : x, ch === 'b' ? y - 1 : y, ch === 'c' ? z - 1 : z, ch, ch === last ? run + 1 : 1))
    }
    memo.set(key, best)
    return best
  }
  return go(a, b, c, '', 0)
}

function hasTriple(s) { return /(.)\1\1/.test(s) }

test('sample {a: 2, b: 2, c: 1} gives length 5 with no triple', () => {
  const result = solve({ a: 2, b: 2, c: 1 })
  assert.equal(result.length, 5)
  assert.ok(!hasTriple(result))
})

test('only one letter available gives at most two of it', () => {
  assert.equal(solve({ a: 0, b: 0, c: 9 }), 'cc')
})

test('random budgets reach the exhaustive maximum and respect the budgets', () => {
  let seed = 31
  const rnd = m => { seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff; return (seed >> 8) % m }
  for (let t = 0; t < 200; t++) {
    const counts = { a: rnd(7), b: rnd(7), c: rnd(7) }
    if (counts.a + counts.b + counts.c === 0) continue
    const result = solve(counts)
    assert.equal(result.length, maxLength(counts.a, counts.b, counts.c), JSON.stringify(counts))
    assert.ok(!hasTriple(result), result)
    for (const ch of 'abc') assert.ok(result.split(ch).length - 1 <= counts[ch], JSON.stringify(counts))
  }
})

test('malformed input is rejected', () => {
  assert.throws(() => parseInput('{"a": 1, "b": 1}'))
  assert.throws(() => parseInput('{"a": 0, "b": 0, "c": 0}'))
  assert.throws(() => parseInput('[1, 2, 3]'))
})

test('every frame names a declared phase and a valid code line', () => {
  const run = buildTrace({ a: 2, b: 2, c: 1 })
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase), frame.phase)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
