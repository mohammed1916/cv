import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('735 official examples', () => {
  assert.deepEqual(buildTrace([5, 10, -5]).result, [5, 10])
  assert.deepEqual(buildTrace([8, -8]).result, [])
  assert.deepEqual(buildTrace([10, 2, -5]).result, [10])
  assert.deepEqual(buildTrace([-2, -1, 1, 2]).result, [-2, -1, 1, 2])
})

// Oracle: repeatedly remove collisions by scanning adjacent pairs until nothing changes.
test('735 random asteroids match repeated adjacent-pair elimination', () => {
  let state = 311
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 400; t++) {
    const nums = Array.from({ length: 1 + rand(8) }, () => (rand(2) ? 1 : -1) * (1 + rand(5)))
    let a = [...nums]
    let changed = true
    while (changed) {
      changed = false
      for (let i = 0; i + 1 < a.length; i++) {
        if (a[i] > 0 && a[i + 1] < 0) {
          changed = true
          if (a[i] + a[i + 1] === 0) a.splice(i, 2)
          else if (a[i] > -a[i + 1]) a.splice(i + 1, 1)
          else a.splice(i, 1)
          break
        }
      }
    }
    assert.deepEqual(buildTrace(nums).result, a, JSON.stringify(nums))
  }
})

test('735 rejects zero', () => {
  assert.throws(() => parseInput('[0]'))
})
