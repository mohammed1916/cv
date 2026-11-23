import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
import { mazeTutorial } from './tutorial.js'
import { examples } from './presets.js'

const solve = text => buildTrace(parseInput(text)).result

// Reference: Bellman-Ford style relaxation over every roll, repeated until nothing changes.
function oracle({ maze, start, destination }) {
  const rows = maze.length, cols = maze[0].length
  const dist = Array.from({ length: rows }, () => Array(cols).fill(Infinity))
  dist[start[0]][start[1]] = 0
  let changed = true
  while (changed) {
    changed = false
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      if (dist[r][c] === Infinity) continue
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        let nr = r, nc = c, steps = 0
        while (nr + dr >= 0 && nr + dr < rows && nc + dc >= 0 && nc + dc < cols && maze[nr + dr][nc + dc] === 0) { nr += dr; nc += dc; steps++ }
        if (dist[r][c] + steps < dist[nr][nc]) { dist[nr][nc] = dist[r][c] + steps; changed = true }
      }
    }
  }
  return dist[destination[0]][destination[1]] === Infinity ? -1 : dist[destination[0]][destination[1]]
}

test('505 worked examples from the presets', () => {
  assert.equal(solve(examples[0].input), 4)
  assert.equal(solve(examples[1].input), -1)
  assert.equal(solve(examples[0].input), 4)
  assert.equal(solve(examples[2].input), 0)
})

test('505 random mazes match a relaxation oracle', () => {
  let seed = 505
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const rows = 1 + rnd(5), cols = 1 + rnd(5)
    const maze = Array.from({ length: rows }, () => Array.from({ length: cols }, () => (rnd(4) === 0 ? 1 : 0)))
    const empty = []
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (maze[r][c] === 0) empty.push([r, c])
    if (empty.length === 0) continue
    const start = empty[rnd(empty.length)], destination = empty[rnd(empty.length)]
    const input = { maze, start, destination }
    assert.equal(buildTrace(parseInput(JSON.stringify(input))).result, oracle(input), JSON.stringify(input))
  }
})

test('505 every frame has a reason', () => {
  const traced = buildTrace(parseInput(examples[0].input))
  for (const frame of traced.frames) assert.ok(mazeTutorial({ step: frame }).reason.length > 20)
})
