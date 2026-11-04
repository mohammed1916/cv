import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, cellKey, neighbours, parseInput, python } from './algorithm.js'

const solve = n => buildTrace({ n }).result

// Independent percolation over bit masks, with cells numbered row by row.
function cellsOf(n) {
  const cells = []
  for (let row = 1; row <= n; row++) for (let j = 1; j < 2 * row; j++) cells.push([row, j])
  return cells
}

function adjacency(n) {
  const id = new Map(cellsOf(n).map(([r, j], i) => [cellKey(r, j), i]))
  return cellsOf(n).map(([r, j]) => neighbours(r, j, n).map(([a, b]) => id.get(cellKey(a, b))))
}

function fills(seeds, adj) {
  const red = new Uint8Array(adj.length)
  let count = 0
  for (const s of seeds) { if (!red[s]) { red[s] = 1; count++ } }
  let moved = true
  while (moved && count < adj.length) {
    moved = false
    for (let i = 0; i < adj.length; i++) {
      if (red[i]) continue
      let c = 0
      for (const nb of adj[i]) c += red[nb]
      if (c >= 2) { red[i] = 1; count++; moved = true }
    }
  }
  return count === adj.length
}

function anySetOfSizeFills(adj, size) {
  const chosen = []
  const go = start => {
    if (chosen.length === size) return fills(chosen, adj)
    for (let i = start; i <= adj.length - (size - chosen.length); i++) {
      chosen.push(i)
      if (go(i + 1)) return true
      chosen.pop()
    }
    return false
  }
  return go(0)
}

test('2647 hand-counted seed lists', () => {
  assert.deepEqual(solve(1), [[1, 1]])
  // Side 4: bottom row 4 upward slots, row 3 slot 2, row 2 slot 3, plus the apex.
  assert.deepEqual(solve(4), [[1, 1], [4, 1], [4, 3], [4, 5], [4, 7], [3, 2], [2, 3]])
  // Side 5 adds row 3's upward slots from 3, and the left corner of row 2.
  assert.deepEqual(solve(5), [[1, 1], [5, 1], [5, 3], [5, 5], [5, 7], [5, 9], [4, 2], [3, 3], [3, 5], [2, 1]])
})

test('2647 neighbour rule on a hand-drawn side 3 figure', () => {
  assert.deepEqual(neighbours(1, 1, 3), [[2, 2]])
  assert.deepEqual(neighbours(2, 2, 3), [[2, 1], [2, 3], [1, 1]])
  assert.deepEqual(neighbours(3, 1, 3), [[3, 2]])
  assert.deepEqual(neighbours(3, 3, 3), [[3, 2], [3, 4]])
})

test('2647 the seeds fill the figure for every side the view allows, and well beyond', () => {
  for (let n = 1; n <= 60; n++) assert.ok(fills(solve(n).map(([r, j]) => cellsOf(n).findIndex(([a, b]) => a === r && b === j)), adjacency(n)), `side ${n}`)
})

test('2647 no smaller set works: exhaustive check of every one-smaller set', () => {
  for (let n = 1; n <= 5; n++) {
    const adj = adjacency(n)
    const k = solve(n).length
    assert.equal(anySetOfSizeFills(adj, k - 1), false, `side ${n} has a set of ${k - 1}`)
  }
})

test('2647 frames show the seeds growing and the figure ending red', () => {
  for (let n = 1; n <= 12; n++) {
    const { frames, result, allRed } = buildTrace({ n })
    assert.equal(allRed, true)
    const last = frames.at(-1)
    assert.equal(last.phase, 'done')
    assert.equal(last.red.length, n * n)
    assert.equal(last.seeds.length, result.length)
    const lines = python.trim().split('\n').length
    let previous = 0
    for (const f of frames) {
      assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1)
      assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= lines)
      assert.ok(f.message.length > 0)
      assert.ok(f.red.length >= previous, 'red never shrinks')
      previous = f.red.length
    }
    for (const f of frames.filter(x => x.phase === 'check')) {
      assert.ok(f.support.length >= 2)
      assert.ok(!f.red.includes(cellKey(f.focus[0], f.focus[1])))
    }
    for (const f of frames.filter(x => x.phase === 'spread')) assert.ok(f.red.includes(cellKey(f.focus[0], f.focus[1])))
  }
})

test('2647 parseInput enforces the range', () => {
  assert.deepEqual(parseInput('{"n":7}'), { n: 7 })
  for (const bad of ['{"n":0}', '{"n":13}', '{"n":2.5}', '[]', '{"m":3}']) assert.throws(() => parseInput(bad))
})
