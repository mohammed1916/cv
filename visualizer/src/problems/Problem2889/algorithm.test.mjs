import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python, code } from './algorithm.js'

const row = (city, month, temperature) => ({ city, month, temperature })

test('2889 sorts labels as text and places each value', () => {
  const { result } = buildTrace({ weather: [row('Oslo', 'June', 16), row('Oslo', 'July', 18), row('Cairo', 'June', 34), row('Cairo', 'July', 36)] })
  assert.deepEqual(result.columns, ['month', 'Cairo', 'Oslo'])
  assert.deepEqual(result.rows, [['July', 36, 18], ['June', 34, 16]])
})

test('2889 leaves absent pairs missing and keeps zero as a value', () => {
  const { result } = buildTrace({ weather: [row('Lima', 'Spring', 0), row('Quito', 'Autumn', 14)] })
  assert.deepEqual(result.columns, ['month', 'Lima', 'Quito'])
  assert.deepEqual(result.rows, [['Autumn', null, 14], ['Spring', 0, null]])
})

test('2889 single row', () => {
  const { result } = buildTrace({ weather: [row('Reykjavik', 'Winter', -3)] })
  assert.deepEqual(result, { columns: ['month', 'Reykjavik'], rows: [['Winter', -3]] })
})

test('2889 uses code-point order, so uppercase sorts first', () => {
  const { result } = buildTrace({ weather: [row('b', 'x', 1), row('B', 'x', 2), row('a', 'x', 3)] })
  assert.deepEqual(result.columns, ['month', 'B', 'a', 'b'])
})

test('2889 input validation', () => {
  assert.throws(() => parseInput('{"weather":[]}'))
  assert.throws(() => parseInput('[1]'))
  assert.throws(() => parseInput('{"weather":[{"city":"A","month":"M","temperature":1.5}]}'))
  assert.throws(() => parseInput('{"weather":[{"city":"A","month":"M","temperature":1},{"city":"A","month":"M","temperature":2}]}'), /two rows/)
  assert.deepEqual(parseInput('{"weather":[{"city":"A","month":"M","temperature":1,"extra":9}]}').weather, [row('A', 'M', 1)])
})

test('2889 random tables: every input fact is found by label lookup and nothing else exists', () => {
  let seed = 2889
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const pairs = new Map()
    const size = 1 + rnd(15)
    for (let k = 0; k < size; k++) pairs.set(`${rnd(5)}|${rnd(4)}`, rnd(60) - 20)
    const weather = [...pairs].map(([key, temperature]) => {
      const [m, c] = key.split('|')
      return row(`c${c}`, `m${m}`, temperature)
    })
    const { result } = buildTrace({ weather })
    let found = 0
    result.rows.forEach(([month, ...values]) => values.forEach((value, c) => {
      const expected = weather.find(w => w.month === month && w.city === result.columns[c + 1])
      assert.equal(value, expected ? expected.temperature : null)
      if (expected) found++
    }))
    assert.equal(found, weather.length)
    assert.deepEqual(result.columns.slice(1), [...result.columns.slice(1)].sort())
    assert.deepEqual(result.rows.map(r => r[0]), result.rows.map(r => r[0]).sort())
  }
})

test('2889 frames grow the grid one cell at a time and map to real lines', () => {
  const weather = [row('Oslo', 'June', 16), row('Cairo', 'June', 34), row('Oslo', 'May', 11)]
  const { frames } = buildTrace({ weather })
  const pyLines = python.split('\n')
  for (const f of frames) {
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(pyLines[f.pythonLine - 1].trim().length > 0, f.phase)
    assert.ok(f.message.length > 0)
  }
  const places = frames.filter(f => f.phase === 'place')
  assert.equal(places.length, weather.length)
  places.forEach((f, i) => {
    assert.equal(f.grid.flat().filter(v => v !== null).length, i + 1)
    assert.equal(f.grid[f.target[0]][f.target[1]], weather[i].temperature)
  })
  assert.equal(frames.at(-1).phase, 'done')
})
