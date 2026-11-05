const JS = [
  'function getSize(columns, data) {',
  '  const rows = data.length',
  '  const cols = columns.length',
  '  return [rows, cols]',
  '}',
]
export const code = JS.map((text, index) => ({ line: index + 1, text }))
const L = s => JS.findIndex(t => t.includes(s)) + 1

const PY = `import pandas as pd

def get_size(students):
    return list(students.shape)`
export const python = PY
const P = s => PY.split('\n').findIndex(t => t.includes(s)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.columns) || !Array.isArray(input.data)) {
    throw new Error('Use { "columns": [...], "data": [[...], ...] }.')
  }
  if (input.data.some(row => !Array.isArray(row) || row.length !== input.columns.length)) {
    throw new Error('Each row must have one value per column.')
  }
  return { columns: [...input.columns], data: input.data.map(row => [...row]) }
}

export function buildTrace({ columns, data }) {
  const result = [data.length, columns.length]
  const frames = [
    { phase: 'start', activeLine: L('const rows'), pythonLine: P('return list'), message: `Count the data rows: ${data.length}. The header is not a data row.`, at: 0, out: [String(data.length), '?'] },
    { phase: 'step', activeLine: L('const cols'), pythonLine: P('return list'), message: `Count the columns: ${columns.length}.`, at: 1, out: [String(data.length), String(columns.length)] },
    { phase: 'done', activeLine: L('return [rows, cols]'), pythonLine: P('return list'), message: `Size is [${result[0]}, ${result[1]}].`, at: -1, out: [String(data.length), String(columns.length)] },
  ]
  return { input: { columns, data }, result, frames }
}
