import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('852 peaks are found wherever they sit', () => {
  assert.equal(buildTrace([0, 1, 0]).result, 1)
  assert.equal(buildTrace([0, 2, 1, 0]).result, 1)
  assert.equal(buildTrace([3, 5, 3, 2, 0]).result, 1)
  assert.equal(buildTrace([0, 10, 5, 2]).result, 1)
  assert.equal(buildTrace([0, 1, 2, 3, 4, 3]).result, 4)
})

test('852 random mountains match the index of the maximum', () => {
  let state = 852
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 600; t++) {
    const peak = 1 + rand(8), tail = 1 + rand(8)
    const up = Array.from({ length: peak }, (_, i) => (i + 1) * 3 + rand(2))
    const down = Array.from({ length: tail }, (_, i) => (tail - i) * 3 - 1 + rand(1))
    const arr = [...up, ...down.map(v => Math.min(v, up[up.length - 1] - 1))]
    const want = arr.indexOf(Math.max(...arr))
    let ok = true
    for (let i = 1; i < arr.length; i++) if (i <= want ? arr[i] <= arr[i - 1] : arr[i] >= arr[i - 1]) ok = false
    if (!ok) continue
    assert.equal(buildTrace(arr).result, want, JSON.stringify(arr))
  }
})

test('852 rejects an array that does not rise then fall', () => {
  assert.throws(() => parseInput('[1,2,1,2]'))
})
