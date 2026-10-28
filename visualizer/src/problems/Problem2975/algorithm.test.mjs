import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2975 official examples', () => {
  assert.equal(solve({ m: 4, n: 3, h_fences: [2, 3], v_fences: [2] }), 4)
  assert.equal(solve({ m: 6, n: 7, h_fences: [2], v_fences: [4] }), -1)
})

test('2975 edge cases: no fences on a square field, and no common side', () => {
  assert.equal(solve({ m: 3, n: 3, h_fences: [], v_fences: [] }), 4)
  assert.equal(solve({ m: 3, n: 5, h_fences: [], v_fences: [] }), -1)
  assert.equal(solve({ m: 3, n: 5, h_fences: [], v_fences: [3] }), 4)
})

test('2975 rejects a fence on the boundary and duplicate fences', () => {
  assert.throws(() => parseInput('{"m":4,"n":3,"h_fences":[1],"v_fences":[]}'))
  assert.throws(() => parseInput('{"m":4,"n":3,"h_fences":[2,2],"v_fences":[]}'))
})

// Independent oracle: try every subset of fences to keep, and take the largest common side over all of them.
function oracle({ m, n, h_fences: hf, v_fences: vf }) {
  const subsets = list => {
    const out = []
    for (let mask = 0; mask < 1 << list.length; mask++) out.push(list.filter((_, i) => mask & (1 << i)))
    return out
  }
  const diffs = lines => {
    const set = new Set()
    for (const a of lines) for (const b of lines) set.add(Math.abs(a - b))
    return set
  }
  let best = 0
  for (const kh of subsets(hf)) {
    for (const kv of subsets(vf)) {
      const dh = diffs([1, m, ...kh])
      const dv = diffs([1, n, ...kv])
      for (const side of dh) if (side > 0 && dv.has(side)) best = Math.max(best, side)
    }
  }
  return best === 0 ? -1 : (best * best) % 1000000007
}

test('2975 random fences match a subset-enumeration oracle', () => {
  let seed = 2975
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const pick = (limit, count) => {
    const pool = []
    for (let v = 2; v <= limit - 1; v++) pool.push(v)
    const out = []
    while (out.length < count && pool.length > 0) out.push(pool.splice(rnd(pool.length), 1)[0])
    return out
  }
  for (let t = 0; t < 300; t++) {
    const m = 3 + rnd(8)
    const n = 3 + rnd(8)
    const input = { m, n, h_fences: pick(m, rnd(4)), v_fences: pick(n, rnd(4)) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
