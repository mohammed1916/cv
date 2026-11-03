import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, solveEscape, phases } from './algorithm.js'

function seeded(seed) {
  let s = seed
  return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff }
}

// Oracle: full breadth-first search on a small grid, where the grid edge is a boundary.
function oracle({ blocked, source, target }, size) {
  const wall = new Set(blocked.map(([r, c]) => `${r},${c}`))
  const seen = new Set([`${source[0]},${source[1]}`])
  const queue = [source]
  for (let h = 0; h < queue.length; h++) {
    const [r, c] = queue[h]
    if (r === target[0] && c === target[1]) return true
    for (const [nr, nc] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]) {
      if (nr < 0 || nc < 0 || nr >= size || nc >= size || wall.has(`${nr},${nc}`)) continue
      if (seen.has(`${nr},${nc}`)) continue
      seen.add(`${nr},${nc}`)
      queue.push([nr, nc])
    }
  }
  return false
}

test('phases are well formed', () => {
  assert.ok(phases.length >= 3)
  for (const p of phases) assert.ok(p.id && p.label && p.description)
})

test('cell trapped in a corner pocket cannot escape', () => {
  const input = parseInput('{"blocked":[[0,1],[1,0]],"source":[0,0],"target":[5,5]}')
  assert.equal(buildTrace(input).result, false)
  assert.equal(solveEscape(input), false)
})

test('triangle pocket around the corner is detected as enclosed', () => {
  const input = parseInput('{"blocked":[[2,0],[1,1],[0,2]],"source":[0,0],"target":[5,5]}')
  assert.equal(solveEscape(input), false)
})

test('single wall leaves the grid connected', () => {
  const input = parseInput('{"blocked":[[0,1]],"source":[0,0],"target":[999999,999999]}')
  assert.equal(buildTrace(input).result, true)
})

test('start and goal on the same cell are reachable', () => {
  assert.equal(solveEscape(parseInput('{"blocked":[],"source":[3,3],"target":[3,3]}')), true)
})

test('large diagonal wall encloses the corner on the full grid', () => {
  const blocked = Array.from({ length: 30 }, (_, i) => [i, 29 - i])
  const input = parseInput(JSON.stringify({ blocked, source: [0, 0], target: [999999, 999999] }))
  assert.equal(solveEscape(input), false)
})

test('matches breadth-first oracle on random small grids', () => {
  const rnd = seeded(21)
  for (let t = 0; t < 400; t++) {
    const size = 2 + Math.floor(rnd() * 7)
    const cells = []
    for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) cells.push([r, c])
    const pick = () => cells[Math.floor(rnd() * cells.length)]
    const source = pick()
    let target = pick()
    while (target[0] === source[0] && target[1] === source[1]) target = pick()
    const walls = []
    const count = Math.floor(rnd() * Math.min(12, cells.length))
    for (const cell of cells) {
      if (walls.length >= count) break
      if (cell === source || cell === target) continue
      if (rnd() < 0.35) walls.push(cell)
    }
    const input = { blocked: walls, source, target }
    assert.equal(solveEscape(input, size), oracle(input, size), JSON.stringify({ size, ...input }))
  }
})

test('parser rejects out-of-range and blocked endpoints', () => {
  assert.throws(() => parseInput('{"blocked":[[1000000,0]],"source":[0,0],"target":[1,1]}'))
  assert.throws(() => parseInput('{"blocked":[[0,0]],"source":[0,0],"target":[1,1]}'))
  assert.throws(() => parseInput('{"blocked":[[1,1],[1,1]],"source":[0,0],"target":[2,2]}'))
})
