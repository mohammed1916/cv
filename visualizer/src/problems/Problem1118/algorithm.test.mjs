import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code } from './algorithm.js'

// Independent oracle: the Date object's calendar, asked for the last day of the month.
function calendarDays(year, month) {
  const d = new Date(0)
  d.setUTCFullYear(year, month, 0)
  return d.getUTCDate()
}

test('own samples give the expected month lengths', () => {
  const expect = [
    [{ year: 2023, month: 2 }, 28],
    [{ year: 2024, month: 2 }, 29],
    [{ year: 1900, month: 2 }, 28],
    [{ year: 2000, month: 2 }, 29],
    [{ year: 2026, month: 4 }, 30],
    [{ year: 2026, month: 7 }, 31],
  ]
  for (const [input, days] of expect) assert.equal(buildTrace(input).result, days, JSON.stringify(input))
})

test('every month for years 1 to 2500 agrees with the calendar oracle', () => {
  for (let year = 1; year <= 2500; year++) {
    for (let month = 1; month <= 12; month++) {
      assert.equal(buildTrace({ year, month }).result, calendarDays(year, month), `${year}-${month}`)
    }
  }
})

test('century years follow the 400 exception', () => {
  for (const year of [1700, 1800, 1900, 2100, 2200]) assert.equal(buildTrace({ year, month: 2 }).result, 28)
  for (const year of [1600, 2000, 2400]) assert.equal(buildTrace({ year, month: 2 }).result, 29)
})

test('every frame names a declared phase and a real code line', () => {
  const ids = new Set(phases.map(p => p.id))
  for (const input of [{ year: 2024, month: 2 }, { year: 2026, month: 4 }, { year: 2026, month: 7 }]) {
    const run = buildTrace(input)
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const f of run.frames) {
      assert.ok(ids.has(f.phase), f.phase)
      assert.ok(f.message.length > 10)
      assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
      assert.ok(f.snapshot && f.snapshot.year === input.year)
    }
  }
})

test('invalid input is rejected with a readable message', () => {
  assert.throws(() => parseInput('{"year":2024,"month":13}'), /month/)
  assert.throws(() => parseInput('{"year":0,"month":1}'), /year/)
  assert.throws(() => parseInput('{"year":2024}'), /integer/)
  assert.deepEqual(parseInput('{"year":2024,"month":2}'), { year: 2024, month: 2 })
})
