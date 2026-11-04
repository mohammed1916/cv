import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases, QUARTERS } from './algorithm.js'

const row = (product, a, b, c, d) => ({ product, quarter_1: a, quarter_2: b, quarter_3: c, quarter_4: d })
const pyLines = python.trim().split('\n')

test('2890 hand-computed melt keeps quarter-first order', () => {
  const { result } = buildTrace({ report: [row('Kite', 1, 2, 3, 4), row('Oar', 5, 6, 7, 8)] })
  assert.deepEqual(result, [
    { product: 'Kite', quarter: 'quarter_1', sales: 1 }, { product: 'Oar', quarter: 'quarter_1', sales: 5 },
    { product: 'Kite', quarter: 'quarter_2', sales: 2 }, { product: 'Oar', quarter: 'quarter_2', sales: 6 },
    { product: 'Kite', quarter: 'quarter_3', sales: 3 }, { product: 'Oar', quarter: 'quarter_3', sales: 7 },
    { product: 'Kite', quarter: 'quarter_4', sales: 4 }, { product: 'Oar', quarter: 'quarter_4', sales: 8 },
  ])
})

test('2890 edge cases', () => {
  assert.deepEqual(buildTrace({ report: [] }).result, [])
  assert.equal(buildTrace({ report: [row('Solo', 0, 0, 0, 0)] }).result.length, 4)
  const twins = buildTrace({ report: [row('Same', 1, 1, 1, 1), row('Same', 2, 2, 2, 2)] }).result
  assert.deepEqual(twins.slice(0, 2).map(r => r.sales), [1, 2])
})

test('2890 parseInput rejects malformed tables', () => {
  assert.doesNotThrow(() => parseInput('{"report":[]}'))
  assert.throws(() => parseInput('{"report":[{"product":"A","quarter_1":1}]}'))
  assert.throws(() => parseInput('{"report":[{"product":"A","quarter_1":1,"quarter_2":2,"quarter_3":3,"quarter_4":"x"}]}'))
  assert.throws(() => parseInput('{"report":[{"product":"","quarter_1":1,"quarter_2":2,"quarter_3":3,"quarter_4":4}]}'))
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput(JSON.stringify({ report: Array(9).fill(row('A', 1, 2, 3, 4)) })))
})

// Oracle: rebuild the wide table from the long one and require an exact round trip plus quarter order.
function assertRoundTrip(report, result) {
  assert.equal(result.length, report.length * 4)
  const perQuarter = report.length
  QUARTERS.forEach((quarter, q) => {
    const group = result.slice(q * perQuarter, (q + 1) * perQuarter)
    group.forEach((entry, r) => {
      assert.equal(entry.quarter, quarter)
      assert.equal(entry.product, report[r].product)
      assert.equal(entry.sales, report[r][quarter])
    })
  })
}

test('2890 round-trip oracle on random tables', () => {
  let seed = 2890
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % m }
  for (let t = 0; t < 200; t++) {
    const report = Array.from({ length: rnd(9) }, (_, i) => row(`P${rnd(4)}${i}`, rnd(1000), rnd(1000), rnd(1000), rnd(1000)))
    assertRoundTrip(report, buildTrace({ report }).result)
  }
})

test('2890 frames map to executed lines and draw consistent state', () => {
  const expected = { start: 'long_rows = []', column: 'for quarter', read: 'for _, record', append: 'long_rows.append', done: 'return pd.DataFrame' }
  const report = [row('Kite', 12, 40, 75, 9), row('Oar', 310, 0, 58, 144)]
  for (const input of [{ report }, { report: [] }]) {
    const { frames, result } = buildTrace(input)
    const ids = new Set(phases.map(p => p.id))
    let appended = 0
    for (const f of frames) {
      assert.ok(ids.has(f.phase))
      assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
      assert.ok(pyLines[f.pythonLine - 1].includes(expected[f.phase]), `${f.phase} -> ${pyLines[f.pythonLine - 1]}`)
      assert.ok(f.message && !f.message.includes('undefined'))
      if (f.phase === 'append') { appended++; assert.equal(f.activeOutput, f.output.length - 1) }
      assert.equal(f.output.length, appended)
      assert.equal(f.consumed.length, appended)
    }
    assert.deepEqual(frames.at(-1).output, result)
    assert.equal(frames.at(-1).phase, 'done')
  }
})
