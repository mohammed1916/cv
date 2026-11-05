const JS = [
  'function firstThreeRows(rows) {',
  '  const kept = []',
  '  for (let i = 0; i < rows.length && i < 3; i++) {',
  '    kept.push(rows[i])',
  '  }',
  '  return kept',
  '}',
]
export const code = JS.map((text, index) => ({ line: index + 1, text }))
const L = s => JS.findIndex(t => t.includes(s)) + 1

const PY = `import pandas as pd

def first_three(employees):
    return employees.head(3)`
export const python = PY
const P = s => PY.split('\n').findIndex(t => t.includes(s)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.rows)) throw new Error('Use { "rows": [ {...}, ... ] }.')
  return { rows: input.rows.map(row => ({ ...row })) }
}

export function buildTrace({ rows }) {
  const out = []
  const frames = [{ phase: 'start', activeLine: L('const kept'), pythonLine: P('return employees'), message: `The table has ${rows.length} row(s). Only the first three are kept.`, at: -1, out: [] }]
  for (let i = 0; i < Math.min(3, rows.length); i++) {
    out.push(JSON.stringify(rows[i]))
    frames.push({ phase: 'step', activeLine: L('kept.push'), pythonLine: P('return employees'), message: `Keep row ${i} in its original position.`, at: i, out: [...out] })
  }
  frames.push({ phase: 'done', activeLine: L('return kept'), pythonLine: P('return employees'), message: `${out.length} row(s) returned; the rest of the table is not shown.`, at: -1, out: [...out] })
  return { input: { rows }, result: out.map(s => JSON.parse(s)), frames }
}
