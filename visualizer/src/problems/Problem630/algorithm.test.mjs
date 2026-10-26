import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('630 official examples', () => {
  assert.equal(buildTrace([[100, 200], [200, 1300], [1000, 1250], [2000, 3200]]).result, 3)
  assert.equal(buildTrace([[1, 2]]).result, 1)
  assert.equal(buildTrace([[3, 2], [4, 3]]).result, 0)
})

test('630 random small instances match an exhaustive subset search', () => {
  let state = 23
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 400; t++) {
    const courses = Array.from({ length: 1 + rand(7) }, () => [1 + rand(6), 1 + rand(15)])
    let best = 0
    for (let mask = 0; mask < 1 << courses.length; mask++) {
      const chosen = courses.filter((_, i) => mask & (1 << i)).sort((a, b) => a[1] - b[1])
      let time = 0, ok = true
      for (const [d, last] of chosen) { time += d; if (time > last) { ok = false; break } }
      if (ok) best = Math.max(best, chosen.length)
    }
    assert.equal(buildTrace(courses).result, best, JSON.stringify(courses))
  }
})

test('630 rejects invalid pairs', () => {
  assert.throws(() => parseInput('[[0,5]]'))
})
