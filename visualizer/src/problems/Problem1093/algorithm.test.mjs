import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = count => buildTrace(count).result
const zeros = () => Array(256).fill(0)

test('1093 official example', () => {
  const count = zeros()
  count[1] = 1; count[2] = 3; count[3] = 4
  assert.deepEqual(solve(parseInput(JSON.stringify(count))), [1, 3, 2.375, 2.5, 3])
})

test('1093 single sample and an odd total', () => {
  const single = zeros(); single[7] = 1
  assert.deepEqual(solve(parseInput(JSON.stringify(single))), [7, 7, 7, 7, 7])
  const odd = zeros(); odd[5] = 2; odd[9] = 1
  // Sorted samples are 5, 5, 9: the median is the middle one, 5.
  assert.deepEqual(solve(parseInput(JSON.stringify(odd))), [5, 9, 19 / 3, 5, 5])
})

test('1093 rejects a tie for the mode and a wrong length', () => {
  const tie = zeros(); tie[0] = 2; tie[1] = 2
  assert.throws(() => parseInput(JSON.stringify(tie)), /unique/)
  assert.throws(() => parseInput(JSON.stringify([1])))
})

// Independent oracle: expand every sample into a sorted list and read the statistics from it.
function oracle(count) {
  const samples = []
  count.forEach((c, v) => { for (let i = 0; i < c; i++) samples.push(v) })
  samples.sort((a, b) => a - b)
  const n = samples.length
  const mean = samples.reduce((a, b) => a + b, 0) / n
  const median = n % 2 ? samples[(n - 1) / 2] : (samples[n / 2 - 1] + samples[n / 2]) / 2
  const freq = new Map()
  for (const s of samples) freq.set(s, (freq.get(s) || 0) + 1)
  const top = Math.max(...freq.values())
  const mode = [...freq].find(([, c]) => c === top)[0]
  return [samples[0], samples[n - 1], mean, median, mode]
}

test('1093 random counts match an expanded-sample oracle', () => {
  let seed = 1093
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  let checked = 0
  for (let t = 0; t < 300; t++) {
    const count = zeros()
    for (let i = 0; i < 1 + rnd(8); i++) count[rnd(256)] += 1 + rnd(5)
    let input
    try { input = parseInput(JSON.stringify(count)) } catch { continue }
    checked++
    assert.deepEqual(solve(input), oracle(count), JSON.stringify(count))
  }
  assert.ok(checked > 100)
})
