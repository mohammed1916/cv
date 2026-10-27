import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('1340 official examples', () => {
  assert.equal(solve('{"arr":[6,4,14,6,8,13,9,7,10,6,12],"d":2}'), 4)
  assert.equal(solve('{"arr":[3,3,3,3,3],"d":3}'), 1)
  assert.equal(solve('{"arr":[7,6,5,4,3,2,1],"d":1}'), 7)
})

test('1340 a jump may not cross a value at least as large as the start', () => {
  // From index 0 (value 4) the jump to index 2 (value 3) would pass the 5, which is not below 4, so it is blocked.
  const trace = buildTrace(parseInput('{"arr":[4,5,3],"d":2}'))
  assert.deepEqual(trace.frames.find(f => f.phase === 'visit' && f.index === 0).targets, [])
  assert.equal(trace.result, 2)
})

test('1340 rejects a jump length larger than the array', () => {
  assert.throws(() => parseInput('{"arr":[1,2],"d":3}'))
})

// Independent oracle: enumerate every legal walk explicitly and keep the longest one.
// A jump i -> j is legal when 1 <= |i - j| <= d, arr[j] < arr[i], and every index strictly between them is also below arr[i].
function oracle({ arr, d }) {
  const legal = (i, j) => {
    if (Math.abs(i - j) < 1 || Math.abs(i - j) > d) return false
    if (!(arr[j] < arr[i])) return false
    const lo = Math.min(i, j)
    const hi = Math.max(i, j)
    for (let k = lo + 1; k < hi; k++) if (!(arr[k] < arr[i])) return false
    return true
  }
  let best = 0
  const walk = (i, length) => {
    best = Math.max(best, length)
    for (let j = 0; j < arr.length; j++) if (legal(i, j)) walk(j, length + 1)
  }
  for (let i = 0; i < arr.length; i++) walk(i, 1)
  return best
}

test('1340 random arrays match an explicit walk enumeration', () => {
  let seed = 1340
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const arr = Array.from({ length: n }, () => 1 + rnd(6))
    const input = { arr, d: 1 + rnd(n) }
    assert.equal(buildTrace(parseInput(JSON.stringify(input))).result, oracle(input), JSON.stringify(input))
  }
})
