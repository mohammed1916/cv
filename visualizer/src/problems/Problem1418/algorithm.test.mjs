import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const SAMPLE = [['Ana', '3', 'Soup'], ['Ben', '1', 'Bread'], ['Cy', '3', 'Bread'], ['Dee', '10', 'Soup'], ['Eli', '1', 'Soup']]

// Independent oracle: sort tables as numbers and foods as strings, then count each cell directly.
function oracle(orders) {
  const foods = [...new Set(orders.map(o => o[2]))].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
  const tables = [...new Set(orders.map(o => Number(o[1])))].sort((a, b) => a - b)
  const rows = [['Table', ...foods]]
  for (const t of tables) {
    rows.push([String(t), ...foods.map(f => String(orders.filter(o => Number(o[1]) === t && o[2] === f).length))])
  }
  return rows
}

test('sample orders give the header plus one row per table in numeric order', () => {
  assert.deepEqual(buildTrace(SAMPLE).result, [
    ['Table', 'Bread', 'Soup'],
    ['1', '1', '1'],
    ['3', '1', '1'],
    ['10', '0', '1'],
  ])
})

test('table 10 sorts after table 9', () => {
  const run = buildTrace([['x', '9', 'Tea'], ['x', '10', 'Tea'], ['x', '2', 'Tea']])
  assert.deepEqual(run.result.slice(1).map(row => row[0]), ['2', '9', '10'])
})

test('random tallies agree with the independent oracle', () => {
  let state = 7
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  const names = ['Soup', 'Bread', 'Tea', 'Cake', 'Milk Tea']
  for (let t = 0; t < 200; t++) {
    const n = 1 + rand(25)
    const orders = Array.from({ length: n }, () => [`c${rand(9)}`, String(1 + rand(12)), names[rand(names.length)]])
    assert.deepEqual(buildTrace(orders).result, oracle(orders), JSON.stringify(orders))
  }
})

test('every frame names a valid phase and a code line inside the solver', () => {
  const ids = new Set(phases.map(p => p.id))
  const run = buildTrace(SAMPLE)
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.message.length > 5)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
  }
  assert.equal(run.frames.at(-1).phase, 'result')
  assert.equal(code.length, python.split('\n').length)
})

test('invalid orders are rejected with a readable message', () => {
  assert.throws(() => parseInput('[]'), /1 to 500/)
  assert.throws(() => parseInput('[["a","0","Tea"]]'), /Order 1: the table/)
  assert.throws(() => parseInput('[["a","2"]]'), /three strings/)
  assert.throws(() => parseInput('nope'), /JSON array/)
})
