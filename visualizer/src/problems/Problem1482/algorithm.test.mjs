import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: a day works when some m disjoint runs of k bloomed flowers exist.
// Try every day from 1 upward and search for the disjoint windows directly.
function oracle(bloomDay, m, k) {
  if (m * k > bloomDay.length) return -1
  const works = day => {
    const pick = (i, left) => {
      if (left === 0) return true
      if (i + k > bloomDay.length) return false
      const window = bloomDay.slice(i, i + k).every(b => b <= day)
      return (window && pick(i + k, left - 1)) || pick(i + 1, left)
    }
    return pick(0, m)
  }
  const top = Math.max(...bloomDay)
  for (let day = 1; day <= top; day++) if (works(day)) return day
  throw new Error('unreachable for valid inputs')
}

test('hand-checked cases', () => {
  assert.equal(buildTrace({ bloomDay: [4, 9, 2], m: 2, k: 2 }).result, -1)
  assert.equal(buildTrace({ bloomDay: [5, 1, 4], m: 1, k: 2 }).result, 4)
  assert.equal(buildTrace({ bloomDay: [7, 3, 9, 2, 8, 4, 6, 5], m: 2, k: 3 }).result, 9)
})

test('random small gardens agree with the window oracle', () => {
  let state = 33
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 400; t++) {
    const n = 1 + rand(9)
    const bloomDay = Array.from({ length: n }, () => 1 + rand(12))
    const m = 1 + rand(4)
    const k = 1 + rand(4)
    assert.equal(buildTrace({ bloomDay, m, k }).result, oracle(bloomDay, m, k), JSON.stringify({ bloomDay, m, k }))
  }
})

test('frames end with done and every probe frame has a midpoint inside the range', () => {
  const run = buildTrace({ bloomDay: [10, 2, 8, 6, 1, 9, 3], m: 2, k: 2 })
  assert.equal(run.frames.at(-1).phase, 'done')
  for (const frame of run.frames.filter(f => f.phase === 'probe' && f.scene.mid !== null)) {
    assert.ok(frame.scene.mid >= frame.scene.lo && frame.scene.mid <= frame.scene.hi)
  }
  for (const frame of run.frames) assert.ok(frame.activeLine >= 1 && frame.activeLine <= 16)
})

test('invalid input is rejected with a readable message', () => {
  assert.throws(() => parseInput('[1,2]'), /object/)
  assert.throws(() => parseInput('{"bloomDay":[],"m":1,"k":1}'), /1 to 60/)
  assert.throws(() => parseInput('{"bloomDay":[0],"m":1,"k":1}'), /1 to 1000000000/)
  assert.throws(() => parseInput('{"bloomDay":[1],"m":0,"k":1}'), /m must/)
  assert.throws(() => parseInput('{"bloomDay":[1],"m":1,"k":61}'), /k must/)
})
