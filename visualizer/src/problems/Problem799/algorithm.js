export function parseInput(text) {
  const data = JSON.parse(text)
  const { poured, query_row: row, query_glass: glass } = data ?? {}
  if (!Number.isInteger(poured) || poured < 0 || poured > 100000) throw new Error('poured is an integer from 0 to 100,000.')
  if (!Number.isInteger(row) || row < 0 || row > 99) throw new Error('query_row is an integer from 0 to 99.')
  if (!Number.isInteger(glass) || glass < 0 || glass > row) throw new Error('query_glass must lie between 0 and query_row.')
  return { poured, row, glass }
}

const JS_LINES = [
  'function champagneTower(poured, queryRow, queryGlass) {',
  '  const rows = [[poured]] // rows[r][c] = champagne arriving at glass (r, c)',
  '  for (let r = 0; r < queryRow; r++) {',
  '    const next = Array(r + 2).fill(0)',
  '    for (let c = 0; c <= r; c++) {',
  '      const overflow = Math.max(0, rows[r][c] - 1) // only what is above one full glass spills',
  '      next[c] += overflow / 2 // each glass below splits the overflow evenly',
  '      next[c + 1] += overflow / 2',
  '    }',
  '    rows.push(next)',
  '  }',
  '  return Math.min(1, rows[queryRow][queryGlass]) // a glass holds at most 1',
  '}',
]
const PY_LINES = [
  'def champagne_tower(poured, query_row, query_glass):',
  '    rows = [[float(poured)]]',
  '    for r in range(query_row):',
  '        nxt = [0.0] * (r + 2)',
  '        for c in range(r + 1):',
  '            overflow = max(0.0, rows[r][c] - 1)',
  '            nxt[c] += overflow / 2',
  '            nxt[c + 1] += overflow / 2',
  '        rows.append(nxt)',
  '    return min(1.0, rows[query_row][query_glass])',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// Rows are simulated top down. A glass keeps at most 1 unit; the rest splits equally into the two glasses below.
export function buildTrace({ poured, row, glass }) {
  const rows = [[poured]]
  const frames = [{ phase: 'start', r: 0, rows: rows.map(x => [...x]), activeLine: L('const rows = [[poured]]'), pythonLine: P('rows = [[float'), message: `${poured} units poured into the top glass.` }]
  for (let r = 0; r < row; r++) {
    const next = Array(r + 2).fill(0)
    for (let c = 0; c <= r; c++) {
      const overflow = Math.max(0, rows[r][c] - 1)
      next[c] += overflow / 2
      next[c + 1] += overflow / 2
    }
    rows.push(next)
    frames.push({ phase: 'row', r: r + 1, rows: rows.map(x => [...x]), activeLine: L('each glass below splits'), pythonLine: P('nxt[c] += overflow'), message: `Row ${r} spills into row ${r + 1}; every glass there now holds what it received, capped at 1 when read.` })
  }
  const result = Math.min(1, rows[row][glass])
  frames.push({ phase: 'done', r: row, rows: rows.map(x => [...x]), result, activeLine: L('return Math.min'), pythonLine: P('return min'), message: `Glass (${row}, ${glass}) holds ${result.toFixed(4)} of a full glass.` })
  return { input: { poured, row, glass }, result, frames }
}
