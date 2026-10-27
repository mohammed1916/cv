import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('981 official example', () => {
  const ops = [['set', 'foo', 'bar', 1], ['get', 'foo', 1], ['get', 'foo', 3], ['set', 'foo', 'baz', 4], ['get', 'foo', 4], ['get', 'foo', 5]]
  assert.deepEqual(buildTrace(ops).result, [null, 'bar', 'bar', null, 'baz', 'baz'])
})

test('981 a query before the first timestamp returns the empty string', () => {
  assert.deepEqual(buildTrace([['set', 'a', 'x', 5], ['get', 'a', 4]]).result, [null, ''])
})

test('981 rejects timestamps that do not increase for a key', () => {
  assert.throws(() => parseInput('[["set","a","x",2],["set","a","y",2]]'))
})

// Independent oracle: keep every entry and scan the whole list for each query.
function oracle(ops) {
  const entries = new Map()
  return ops.map(op => {
    if (op[0] === 'set') {
      const [, key, value, ts] = op
      if (!entries.has(key)) entries.set(key, [])
      entries.get(key).push([ts, value])
      return null
    }
    const [, key, ts] = op
    let best = null
    for (const [when, value] of entries.get(key) ?? []) {
      if (when <= ts && (best === null || when > best[0])) best = [when, value]
    }
    return best === null ? '' : best[1]
  })
}

test('981 random operations match a full scan', () => {
  let seed = 103
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const clock = { a: 0, b: 0 }
    const ops = []
    for (let i = 0; i < 1 + rnd(20); i++) {
      const key = rnd(2) ? 'a' : 'b'
      if (rnd(2)) {
        clock[key] += 1 + rnd(3)
        ops.push(['set', key, 'v' + rnd(10), clock[key]])
      } else {
        ops.push(['get', key, 1 + rnd(20)])
      }
    }
    assert.deepEqual(buildTrace(ops).result, oracle(ops), JSON.stringify(ops))
  }
})
