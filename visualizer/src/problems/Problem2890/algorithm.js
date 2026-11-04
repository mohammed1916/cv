export const QUARTERS = ['quarter_1', 'quarter_2', 'quarter_3', 'quarter_4']
const COLUMNS = ['product', ...QUARTERS]
export const MAX_ROWS = 8

export const phases = [
  { id: 'start', label: 'Start', description: 'The long table is empty.' },
  { id: 'column', label: 'Column', description: 'Pick the next quarter column.' },
  { id: 'read', label: 'Read', description: 'Read one product and its value in that column.' },
  { id: 'append', label: 'Append', description: 'Write them as one long row.' },
  { id: 'done', label: 'Result', description: 'Every wide cell is now its own row.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with report.')
  const { report } = input
  if (!Array.isArray(report) || report.length > MAX_ROWS) throw new Error(`report is a list of 0 to ${MAX_ROWS} rows.`)
  for (const row of report) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error('Each report row is an object.')
    const keys = Object.keys(row)
    if (keys.length !== COLUMNS.length || !COLUMNS.every(column => keys.includes(column))) throw new Error(`Each row has exactly these columns: ${COLUMNS.join(', ')}.`)
    if (typeof row.product !== 'string' || !row.product) throw new Error('product is a non-empty string.')
    for (const quarter of QUARTERS) if (!Number.isSafeInteger(row[quarter])) throw new Error(`${quarter} is an integer.`)
  }
  return { report }
}

export const code = `reshape a wide sales table into a long one
  start with an empty list of long rows
  for each quarter column, left to right
    for each product row, top to bottom
      write product, quarter name and that cell as one long row
  return the long rows as a table`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}

export const python = `import pandas as pd

def melt_table(report):
    report = pd.DataFrame(report)
    long_rows = []
    for quarter in ['quarter_1', 'quarter_2', 'quarter_3', 'quarter_4']:
        for _, record in report.iterrows():
            long_rows.append({'product': record['product'], 'quarter': quarter, 'sales': record[quarter]})
    return pd.DataFrame(long_rows, columns=['product', 'quarter', 'sales'])
`

export function buildTrace({ report }) {
  const frames = []
  const output = []
  const snap = () => output.map(row => ({ ...row }))
  const consumed = () => output.map(row => `${row.from}:${row.quarter}`)
  const view = row => ({ product: row.product, quarter: row.quarter, sales: row.sales })
  const emit = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, rowIndex: -1, quarter: null, activeOutput: -1, carry: null,
    output: snap().map(view), consumed: consumed(), ...extra,
  })
  emit('start', L('empty list'), 5, `${report.length} wide row${report.length === 1 ? '' : 's'} with 4 quarter columns should become ${report.length * 4} long rows.`)
  for (const quarter of QUARTERS) {
    emit('column', L('each quarter column'), 6, `Take column ${quarter}. Its header becomes the quarter value of every row written now.`, { quarter })
    for (let rowIndex = 0; rowIndex < report.length; rowIndex++) {
      const product = report[rowIndex].product
      const sales = report[rowIndex][quarter]
      const carry = { product, quarter, sales }
      emit('read', L('each product row'), 7, `Row ${rowIndex} under ${quarter}: ${product} sold ${sales}.`, { quarter, rowIndex, carry })
      output.push({ product, quarter, sales, from: rowIndex })
      emit('append', L('as one long row'), 8, `Write (${product}, ${quarter}, ${sales}) as long row ${output.length - 1}.`, { quarter, rowIndex, carry, activeOutput: output.length - 1 })
    }
  }
  const result = output.map(view)
  emit('done', L('return the long rows'), 9, `Done: ${report.length} × 4 cells became ${result.length} long rows, grouped by quarter.`)
  return { input: { report }, result, frames }
}
