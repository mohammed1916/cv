import test from 'node:test'
import assert from 'node:assert/strict'
import {
  linearSources, gridSources, intervalSources, bitmaskSources, knapsackSources,
  describeDpTransition, dpCellRoles, dpWindow, dpFormatValue, normalizeDpSpec,
} from './dpDependencyModel.js'

test('linear sources drop offsets before index 0', () => {
  assert.deepEqual(linearSources(1).map(s => s.cell), [[0, 0]])
  assert.deepEqual(linearSources(5).map(s => s.cell), [[0, 4], [0, 3]])
})

test('grid sources respect the boundary', () => {
  assert.deepEqual(gridSources(0, 0), [])
  assert.deepEqual(gridSources(1, 0).map(s => s.note), ['up'])
  assert.equal(gridSources(2, 3).length, 3)
})

test('interval sources read shorter intervals', () => {
  assert.deepEqual(intervalSources(2, 3).map(s => s.cell), [[3, 3], [2, 2]])
  assert.equal(intervalSources(0, 4).length, 3)
  assert.deepEqual(intervalSources(0, 3, [0, 1]).map(s => s.cell), [[0, 0], [1, 3], [0, 1], [2, 3]])
})

test('bitmask sources remove one set bit', () => {
  assert.deepEqual(bitmaskSources(0b101, 3).map(s => s.cell[1]), [0b100, 0b001])
  assert.deepEqual(bitmaskSources(0, 3), [])
})

test('knapsack sources skip or take', () => {
  assert.deepEqual(knapsackSources(2, 5, 3).map(s => s.cell), [[1, 5], [1, 2]])
  assert.deepEqual(knapsackSources(2, 1, 3).map(s => s.cell), [[1, 1]])
  assert.deepEqual(knapsackSources(0, 5, 3), [])
})

test('roles and description for a grid cell', () => {
  const spec = {
    shape: 'grid', values: [[0, 0, 0], [0, 1, 1], [0, 1, 2]], target: [2, 2],
    sources: gridSources(2, 2).map(s => ({ ...s, chosen: s.note === 'diagonal' })),
    recurrence: 'dp[i][j] = dp[i-1][j-1] + 1 when the characters match', why: 'Matching characters extend the diagonal.',
  }
  const roles = dpCellRoles(spec)
  assert.equal(roles['2,2'], 'target')
  assert.equal(roles['1,1'], 'chosen')
  assert.equal(roles['1,2'], 'source')
  const lines = describeDpTransition(spec)
  assert.match(lines[0], /dp\[2\]\[2\] = 2/)
  assert.match(lines[1], /dp\[1\]\[1\] = 1 \(diagonal\) \[chosen\]/)
  assert.ok(lines.some(l => l.startsWith('Recurrence:')) && lines.some(l => l.startsWith('Why:')))
})

test('1-D specs normalize to one row and name cells dp[i]', () => {
  const spec = { shape: 'linear', values: [1, 1, 2, 3], target: 3, sources: linearSources(3) }
  assert.deepEqual(normalizeDpSpec(spec).values, [[1, 1, 2, 3]])
  assert.match(describeDpTransition(spec)[1], /dp\[2\] = 2 \(1 step back\); dp\[1\] = 1/)
})

test('base case and formatting', () => {
  assert.match(describeDpTransition({ shape: 'linear', values: [1], target: 0 })[1], /base case/)
  assert.equal(dpFormatValue(Infinity), '∞')
  assert.equal(dpFormatValue(null), '·')
})

test('window follows the target in large tables and hides huge 1-D tables', () => {
  const big = Array.from({ length: 30 }, () => Array(30).fill(0))
  const w = dpWindow({ shape: 'grid', values: big, target: [25, 27], sources: gridSources(25, 27) })
  assert.ok(w.rowEnd - w.rowStart <= 12 && w.columnEnd - w.columnStart <= 14)
  assert.ok(w.rowStart <= 24 && w.rowEnd > 25 && w.columnStart <= 26 && w.columnEnd > 27)
  assert.equal(dpWindow({ shape: 'bitmask', values: Array(1024).fill(0), target: 5, sources: [] }).hidden, true)
  assert.equal(dpWindow({ shape: 'bitmask', values: Array(32).fill(0), target: 5, sources: [] }).hidden, false)
})
