// Orders table: one row per minute 1..n (n a multiple of 6). Each interval is six consecutive minutes:
// minutes 1-6 are interval 1, minutes 7-12 are interval 2, and so on. Sum the order counts per interval.
const WIDTH = 6
const MAX_ROWS = 48

export const phases = [
  { id: 'start', label: 'Setup', description: 'Start an empty total for every interval.' },
  { id: 'read', label: 'Read row', description: 'Take the next minute and its order count.' },
  { id: 'bucket', label: 'Interval', description: 'Find the interval number that holds this minute.' },
  { id: 'add', label: 'Add', description: 'Add the order count to that interval total.' },
  { id: 'done', label: 'Result', description: 'Every minute is counted; report intervals in order.' },
]

export function parseInput(text) {
  let rows
  try {
    rows = JSON.parse(text)
  } catch {
    throw new Error('Input must be a JSON list of rows, for example [{"minute":1,"order_count":0}].')
  }
  if (!Array.isArray(rows) || rows.length < WIDTH || rows.length > MAX_ROWS || rows.length % WIDTH !== 0) {
    throw new Error(`Use a list of rows whose length is a multiple of ${WIDTH}, from ${WIDTH} to ${MAX_ROWS}.`)
  }
  rows.forEach((row, index) => {
    if (!row || !Number.isInteger(row.minute) || !Number.isInteger(row.order_count) || row.order_count < 0) {
      throw new Error('Each row needs an integer minute and a whole-number order_count of 0 or more.')
    }
    if (row.minute !== index + 1) throw new Error('minute values run 1, 2, 3 and so on in order.')
  })
  return rows.map(row => ({ minute: row.minute, order_count: row.order_count }))
}

const intervalOf = minute => Math.floor((minute + WIDTH - 1) / WIDTH)

export function buildTrace(rows) {
  const intervals = rows.length / WIDTH
  const totals = Array(intervals).fill(0)
  const frames = []
  const snap = (cursor, interval) => ({ cursor, interval, totals: [...totals] })
  frames.push({ phase: 'start', pythonLine: lineIn(python, 'totals = {}'), activeLine: L('start an empty total'), message: 'Every interval starts with a total of 0.', ...snap(-1, null) })
  rows.forEach((row, index) => {
    const interval = intervalOf(row.minute)
    frames.push({ phase: 'read', pythonLine: lineIn(python, 'for minute, order_count in rows'), activeLine: L('for each row'), message: `Read minute ${row.minute} with ${row.order_count} orders.`, ...snap(index, null) })
    frames.push({ phase: 'bucket', pythonLine: lineIn(python, 'interval = (minute + 5) // 6'), activeLine: L('interval number <-'), message: `Minute ${row.minute} belongs to interval ${interval} (minutes ${(interval - 1) * WIDTH + 1} to ${interval * WIDTH}).`, ...snap(index, interval) })
    totals[interval - 1] += row.order_count
    frames.push({ phase: 'add', pythonLine: lineIn(python, 'totals[interval] = totals.get'), activeLine: L('add c to the total'), message: `Interval ${interval} total is now ${totals[interval - 1]}.`, ...snap(index, interval) })
  })
  const result = totals.map((total, i) => ({ interval_no: i + 1, total_orders: total }))
  frames.push({ phase: 'done', pythonLine: lineIn(python, 'return sorted'), activeLine: L('return the totals'), message: `Report ${result.length} intervals in ascending order.`, ...snap(-1, null) })
  return { input: rows, result, frames }
}

export const code = `total the orders in each six-minute interval
  start an empty total for each interval number
  for each row with minute m and order count c
    interval number <- (m + 5) div 6
    add c to the total for that interval number
  return the totals ordered by interval number`.split('\n').map((text, index) => ({ line: index + 1, text: text.trim() }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode text: ${s}`)
  return index + 1
}

export const python = `def orders_per_interval(rows):
    totals = {}
    for minute, order_count in rows:
        interval = (minute + 5) // 6
        totals[interval] = totals.get(interval, 0) + order_count
    return sorted(totals.items())`

function lineIn(source, text) {
  const index = source.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python text: ${text}`)
  return index + 1
}

export const sql = `-- Orders(minute, order_count): minute is 1..n, n is a multiple of 6
SELECT FLOOR((minute + 5) / 6) AS interval_no, SUM(order_count) AS total_orders
FROM Orders
GROUP BY interval_no
ORDER BY interval_no;`

export const sample = Array.from({ length: 12 }, (_, i) => ({ minute: i + 1, order_count: [3, 0, 5, 2, 1, 4, 6, 6, 0, 2, 3, 1][i] }))
