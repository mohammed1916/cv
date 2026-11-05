import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: unit cells, each cell's covering buildings, then merge equal neighbours.
function oracle(buildings) {
  const lo = Math.min(...buildings.map(b => b[0])), hi = Math.max(...buildings.map(b => b[1]))
  const cells = []
  for (let x = lo; x < hi; x++) {
    const cover = buildings.filter(([s, e]) => s <= x && x < e)
    if (cover.length) cells.push([x, x + 1, Math.floor(cover.reduce((a, b) => a + b[2], 0) / cover.length)])
  }
  const out = []
  for (const cell of cells) {
    const last = out[out.length - 1]
    if (last && last[1] === cell[0] && last[2] === cell[2]) last[1] = cell[1]
    else out.push(cell.slice())
  }
  return out
}

test('examples', () => {
  assert.deepEqual(solve('[[1,4,5],[2,6,3]]'), [[1, 2, 5], [2, 4, 4], [4, 6, 3]])
  assert.deepEqual(solve('[[1,3,2],[3,5,2]]'), [[1, 5, 2]])
  assert.deepEqual(solve('[[1,2,7]]'), [[1, 2, 7]])
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('[[1,3,2]]')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random buildings match the unit-cell oracle', () => {
  let state = 431
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 150; t++) {
    const buildings = Array.from({ length: 1 + rand(6) }, () => {
      const s = 1 + rand(15)
      return [s, s + 1 + rand(10), 1 + rand(9)]
    })
    assert.deepEqual(solve(JSON.stringify(buildings)), oracle(buildings), JSON.stringify(buildings))
  }
})
