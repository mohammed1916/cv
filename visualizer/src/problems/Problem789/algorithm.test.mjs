import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

// Oracle: BFS shortest-path distance on a bounded grid (independent of the closed-form Manhattan formula).
const bfs = (from, to) => {
  const seen = new Map([[from.join(), 0]]); const q = [from]
  for (let h = 0; h < q.length; h++) {
    const [x, y] = q[h]; const d = seen.get(`${x},${y}`)
    if (x === to[0] && y === to[1]) return d
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy
      if (Math.abs(nx) > 12 || Math.abs(ny) > 12 || seen.has(`${nx},${ny}`)) continue
      seen.set(`${nx},${ny}`, d + 1); q.push([nx, ny])
    }
  }
}
test('official examples', () => {
  assert.equal(buildTrace({ ghosts: [[1, 0], [0, 3]], target: [0, 1] }).result, true)
  assert.equal(buildTrace({ ghosts: [[1, 0]], target: [2, 0] }).result, false)
  assert.equal(buildTrace({ ghosts: [[2, 0]], target: [1, 0] }).result, false)
})
test('matches BFS-distance comparison', () => {
  const r = () => Math.floor(Math.random() * 13) - 6
  for (let t = 0; t < 300; t++) {
    const ghosts = Array.from({ length: 1 + Math.floor(Math.random() * 4) }, () => [r(), r()])
    const target = [r(), r()]
    const mine = bfs([0, 0], target)
    const expected = ghosts.every(g => bfs(g, target) > mine)
    const run = buildTrace(parseInput(JSON.stringify({ ghosts, target })))
    assert.equal(run.result, expected)
    assert.equal(run.frames.at(-1).phase, 'done')
  }
})
test('invalid input rejected', () => {
  assert.throws(() => parseInput('{"ghosts":[],"target":[1,1]}'))
  assert.throws(() => parseInput('{"ghosts":[[1,0]],"target":[100,1]}'))
  assert.throws(() => parseInput('3'))
})
