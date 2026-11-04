// Knowledge-derived teaching version. The sample rows are invented for this visualization.
const DATE = /^\d{4}-\d{2}-\d{2}$/

export const code = [
  'WITH unique_rows AS (SELECT DISTINCT sell_date, product FROM Activities)',
  'SELECT sell_date, COUNT(*) AS num_sold,',
  "  GROUP_CONCAT(product ORDER BY product SEPARATOR ',') AS products",
  'FROM unique_rows',
  'GROUP BY sell_date ORDER BY sell_date',
].map((text, index) => ({ line: index + 1, text }))

export const python = [
  'def group_sold(activities):',
  '    unique = activities.drop_duplicates()',
  "    grouped = unique.groupby('sell_date')['product'].agg(num_sold='count', products=lambda s: ','.join(sorted(s)))",
  "    return grouped.reset_index().sort_values('sell_date')",
].join('\n')

const codeLines = code.map(row => row.text)
const pythonLines = python.split('\n')

function lineOf(lines, text) {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`No line contains: ${text}`)
  return index + 1
}

const sqlLine = text => lineOf(codeLines, text)
const pyLine = text => lineOf(pythonLines, text)

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.activities)) throw new Error('Use an object with an activities list.')
  if (input.activities.length > 30) throw new Error('Use at most 30 activity rows.')
  const activities = input.activities.map(row => {
    if (!row || typeof row.sell_date !== 'string' || !DATE.test(row.sell_date)) throw new Error('Each row needs a YYYY-MM-DD sell_date.')
    if (typeof row.product !== 'string' || row.product.length < 1 || row.product.length > 20) throw new Error('Each product is a name of 1 to 20 characters.')
    return { sell_date: row.sell_date, product: row.product }
  })
  return { activities }
}

const compare = (a, b) => (a < b ? -1 : a > b ? 1 : 0)

export function buildTrace(input) {
  const { activities } = input
  const frames = []
  const add = (phase, sql, py, message, rows) => frames.push({
    phase, activeLine: sqlLine(sql), pythonLine: pyLine(py), message, rows: rows.map(row => ({ ...row })),
  })

  add('load', 'FROM Activities', 'def group_sold', `Read ${activities.length} activity rows.`, activities)

  const seen = new Set()
  const distinct = []
  for (const row of [...activities].sort((a, b) => compare(a.sell_date, b.sell_date) || compare(a.product, b.product))) {
    const key = `${row.sell_date}|${row.product}`
    if (seen.has(key)) continue
    seen.add(key)
    distinct.push(row)
  }
  add('dedupe', 'DISTINCT', 'drop_duplicates', `${activities.length - distinct.length} repeated same-day rows count once.`, distinct)

  const dates = [...new Set(distinct.map(row => row.sell_date))].sort(compare)
  const grouped = []
  for (const date of dates) {
    const products = distinct.filter(row => row.sell_date === date).map(row => row.product).sort(compare)
    grouped.push({ sell_date: date, num_sold: products.length, products: products.join(',') })
    add('group', 'COUNT(*)', "agg(num_sold='count'", `${date}: ${products.length} distinct product${products.length === 1 ? '' : 's'}.`, grouped)
    frames[frames.length - 1].date = date
  }

  add('output', 'GROUP BY sell_date', 'reset_index', 'Dates are already in ascending order.', grouped)
  add('done', 'GROUP BY sell_date ORDER BY', 'return grouped', `${grouped.length} date groups returned.`, grouped)

  return { input, result: grouped.map(row => ({ ...row })), frames }
}
