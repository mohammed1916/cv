import test from 'node:test'
import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import { buildTrace, parseInput, code, python, sql, phases } from './algorithm.js'

const row = (id, country, points, winery) => ({ id, country, points, winery })
const solve = rows => buildTrace(parseInput(JSON.stringify({ Wineries: rows }))).result

// Oracle: run the published SQL itself on a real database engine.
function runSql(rows) {
  const db = new DatabaseSync(':memory:')
  db.exec('CREATE TABLE Wineries (id INTEGER PRIMARY KEY, country TEXT, points INTEGER, winery TEXT)')
  const insert = db.prepare('INSERT INTO Wineries VALUES (?, ?, ?, ?)')
  for (const { id, country, points, winery } of rows) insert.run(id, country, points, winery)
  const result = db.prepare(sql).all().map(item => ({ ...item }))
  db.close()
  return result
}

test('2991 hand-computed cases', () => {
  assert.deepEqual(solve([
    row(1, 'Portugal', 30, 'Rio Alto'), row(2, 'Chile', 72, 'Cerro Azul'), row(3, 'Portugal', 55, 'Quinta Sol'),
    row(4, 'Chile', 41, 'Valle Lindo'), row(5, 'Portugal', 25, 'Rio Alto'), row(6, 'Chile', 41, 'Andes Norte'),
    row(7, 'Chile', 18, 'Costa Fria'), row(8, 'Georgia', 63, 'Kakheti Hill'), row(9, 'Chile', 12, 'Cerro Azul'),
  ]), [
    { country: 'Chile', top_winery: 'Cerro Azul (84)', second_winery: 'Andes Norte (41)', third_winery: 'Valle Lindo (41)' },
    { country: 'Georgia', top_winery: 'Kakheti Hill (63)', second_winery: 'No second winery', third_winery: 'No third winery' },
    { country: 'Portugal', top_winery: 'Quinta Sol (55)', second_winery: 'Rio Alto (55)', third_winery: 'No third winery' },
  ])
})

test('2991 edge cases', () => {
  assert.deepEqual(solve([row(50, 'Lebanon', 44, 'Bekaa Terrace')]), [
    { country: 'Lebanon', top_winery: 'Bekaa Terrace (44)', second_winery: 'No second winery', third_winery: 'No third winery' },
  ])
  assert.deepEqual(solve([
    row(1, 'Spain', 20, 'Dorado'), row(2, 'Spain', 90, 'Bodega Mar'), row(3, 'Spain', 45, 'Cuesta'),
    row(4, 'Spain', 45, 'Alameda'), row(5, 'Spain', 10, 'Ermita'),
  ]), [
    { country: 'Spain', top_winery: 'Bodega Mar (90)', second_winery: 'Alameda (45)', third_winery: 'Cuesta (45)' },
  ], 'a fourth winery is left out')
  assert.deepEqual(solve([row(1, 'Peru', 10, 'Same'), row(2, 'Bolivia', 7, 'Same')]), [
    { country: 'Bolivia', top_winery: 'Same (7)', second_winery: 'No second winery', third_winery: 'No third winery' },
    { country: 'Peru', top_winery: 'Same (10)', second_winery: 'No second winery', third_winery: 'No third winery' },
  ], 'one name in two countries stays separate')
  assert.deepEqual(solve([row(1, 'Peru', 3, 'Solo'), row(2, 'Peru', 4, 'Solo')]), [
    { country: 'Peru', top_winery: 'Solo (7)', second_winery: 'No second winery', third_winery: 'No third winery' },
  ], 'repeated rows merge into one place')
})

test('2991 parseInput rejects bad input', () => {
  const bad = rows => assert.throws(() => parseInput(JSON.stringify({ Wineries: rows })))
  bad([])
  bad([row(1, 'A', 1, 'B'), row(1, 'C', 1, 'D')])
  bad([row(1, '', 1, 'B')])
  bad([row(1, 'A', 1, '')])
  bad([row(1, 'A', 1.5, 'B')])
  bad(Array.from({ length: 25 }, (_, i) => row(i, 'A', 1, 'B')))
  assert.throws(() => parseInput('[]'))
})

function randomRows(rnd) {
  const countries = ['Chile', 'Peru', 'Spain', 'Italy']
  const names = ['Alba', 'Brisa', 'Cima', 'Duna', 'Eira', 'Fauna', 'alba']
  return Array.from({ length: 1 + rnd(24) }, (_, id) => row(id + 1, countries[rnd(4)], rnd(12), names[rnd(names.length)]))
}

test('2991 random tables match the SQL run on a database engine', () => {
  let seed = 2991
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let run = 0; run < 1000; run++) {
    const rows = randomRows(rnd)
    assert.deepEqual(solve(rows), runSql(rows), JSON.stringify(rows))
  }
})

test('2991 frames are well formed', () => {
  const ids = new Set(phases.map(phase => phase.id))
  const pyCount = python.split('\n').length
  let seed = 8
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let run = 0; run < 150; run++) {
    const rows = randomRows(rnd)
    const trace = buildTrace({ Wineries: rows })
    assert.equal(trace.frames.at(-1).phase, 'done')
    assert.deepEqual(trace.frames.at(-1).output, trace.result)
    assert.equal(trace.frames.filter(frame => frame.phase === 'sum').length, rows.length)
    for (const frame of trace.frames) {
      assert.ok(ids.has(frame.phase))
      assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
      assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
      assert.ok(frame.message.length > 0)
    }
    // Grouped totals always equal a direct sum of the rows seen so far.
    trace.frames.filter(frame => frame.phase === 'sum').forEach((frame, index) => {
      const seen = rows.slice(0, index + 1)
      for (const entry of frame.totals) {
        const direct = seen.filter(item => item.country === entry.country && item.winery === entry.winery).reduce((sum, item) => sum + item.points, 0)
        assert.equal(entry.total, direct)
      }
    })
  }
})
