import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

// Independent oracle: walk one move at a time, stepping diagonally while both coordinates differ.
function oracle(points) {
  let moves = 0
  for (let i = 0; i + 1 < points.length; i++) {
    let [x, y] = points[i]
    const [tx, ty] = points[i + 1]
    while (x !== tx || y !== ty) {
      if (x !== tx) x += Math.sign(tx - x)
      if (y !== ty) y += Math.sign(ty - y)
      moves++
    }
  }
  return moves
}

test('hand-checked sample legs', () => {
  assert.equal(buildTrace([[0, 0], [3, 1], [1, 5]]).result, 7)
  assert.equal(buildTrace([[-2, 2], [2, -2]]).result, 4)
  assert.equal(buildTrace([[1, 1], [4, 1], [4, 7], [0, 0]]).result, 16)
  assert.equal(buildTrace([[5, 5]]).result, 0)
})

test('random point lists agree with the step-by-step oracle', () => {
  let state = 31
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 300; t++) {
    const points = Array.from({ length: 1 + rand(8) }, () => [rand(41) - 20, rand(41) - 20])
    assert.equal(buildTrace(points).result, oracle(points), JSON.stringify(points))
  }
})

test('every frame points at real pseudocode and Python lines', () => {
  const run = buildTrace([[1, 1], [4, 1], [4, 7], [0, 0]])
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, frame.message)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length, frame.message)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('malformed input is rejected', () => {
  assert.throws(() => parseInput('[[1]]'), /\[x, y\]/)
  assert.throws(() => parseInput('[[101, 0]]'), /-100 to 100/)
  assert.throws(() => parseInput('[]'), /1 to 10/)
})
