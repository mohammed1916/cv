import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('1024 official examples', () => {
  assert.equal(solve({ clips: [[0, 2], [4, 6], [8, 10], [1, 9], [1, 5], [5, 9]], time: 10 }), 3)
  assert.equal(solve({ clips: [[0, 1], [1, 2]], time: 5 }), -1)
})

test('1024 a clip that starts past the covered prefix cannot be used', () => {
  assert.equal(solve({ clips: [[0, 5], [7, 9]], time: 5 }), 1)
  assert.equal(solve({ clips: [[0, 0]], time: 1 }), -1)
})

test('1024 rejects an interval that ends before it starts', () => {
  assert.throws(() => parseInput('{"clips":[[3,1]],"time":2}'))
})

// Independent oracle: try every subset of clips and keep the smallest one that covers every unit segment.
function oracle({ clips, time }) {
  let best = -1
  for (let mask = 1; mask < 1 << clips.length; mask++) {
    const covered = Array(time).fill(false)
    let size = 0
    clips.forEach(([start, end], i) => {
      if (!(mask & (1 << i))) return
      size++
      for (let x = start; x < end; x++) if (x < time) covered[x] = true
    })
    if (covered.every(Boolean) && (best === -1 || size < best)) best = size
  }
  return best
}

test('1024 random clips match a subset oracle', () => {
  let seed = 1024
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const clips = Array.from({ length: 1 + rnd(8) }, () => { const s = rnd(12); return [s, s + rnd(6)] })
    const input = { clips, time: 1 + rnd(12) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
