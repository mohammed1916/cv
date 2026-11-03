import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: sort the x-values and take the largest difference between neighbours.
function oracle(points) {
  const xs = points.map(p => p[0]).sort((a, b) => a - b)
  let best = 0
  for (let i = 1; i < xs.length; i++) best = Math.max(best, xs[i] - xs[i - 1])
  return best
}

test('a hand-made set of four points gives the widest neighbouring gap of 3', () => {
  const run = buildTrace(parseInput('[[3,1],[9,4],[1,7],[6,2]]'))
  assert.equal(run.result, 3)
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('heights are ignored: moving only y-values never changes the result', () => {
  const xs = [5, -2, 11, 0]
  const a = buildTrace(parseInput(JSON.stringify(xs.map(x => [x, 0])))).result
  const b = buildTrace(parseInput(JSON.stringify(xs.map((x, i) => [x, 1000 - i * 37])))).result
  assert.equal(a, b)
  assert.equal(a, oracle(xs.map(x => [x])))
})

test('random point sets agree with the sort-and-compare oracle', () => {
  let state = 17
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rand(11)
    const points = Array.from({ length: n }, () => [rand(2001) - 1000, rand(50)])
    assert.equal(buildTrace(points.map(([x, y]) => ({ x, y }))).result, oracle(points), JSON.stringify(points))
  }
})

test('every frame has a phase, narration, and a valid code line', () => {
  const run = buildTrace(parseInput('[[0,0],[4,0],[10,0]]'))
  for (const frame of run.frames) {
    assert.ok(frame.message.length > 10)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= 6)
  }
  assert.equal(run.result, 6)
})

test('malformed input is rejected', () => {
  assert.throws(() => parseInput('[[1,2]]'))
  assert.throws(() => parseInput('[[1,2.5],[3,4]]'))
  assert.throws(() => parseInput('[[1],[2,3]]'))
})
