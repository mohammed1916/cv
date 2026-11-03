// Teaching rule (not verified against the official statement): ten fixed 60-minute intervals.
const WIDTH = 60
const BUCKETS = 10
const LIMIT = WIDTH * BUCKETS - 1

const lineIn = (lines, text) => {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode text: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Setup', description: 'Start ten interval counters at zero.' },
  { id: 'read', label: 'Read order', description: 'Take the next order minute.' },
  { id: 'bucket', label: 'Bucket', description: 'Find the 60-minute interval that holds it.' },
  { id: 'count', label: 'Count', description: 'Add one to that interval counter.' },
  { id: 'done', label: 'Result', description: 'Every order has been counted.' },
]

export function parseInput(text) {
  const orders = JSON.parse(text)
  if (!Array.isArray(orders) || orders.length > 12) throw new Error('Use a JSON list of at most 12 order minutes.')
  for (const minute of orders) {
    if (!Number.isInteger(minute) || minute < 0 || minute > LIMIT) throw new Error(`Each order minute is an integer from 0 to ${LIMIT}.`)
  }
  return orders
}

export function buildTrace(orders) {
  const counts = Array(BUCKETS).fill(0)
  const frames = []
  const snap = (minute, interval) => ({ minute, interval, counts: [...counts] })
  frames.push({ pythonLine: lineIn(python.split('\n'), 'counts = [0]'), activeLine: L('start ten interval'), phase: 'start', message: 'Ten interval counters start at zero.', row: snap(null, null) })
  for (const minute of orders) {
    const interval = Math.floor(minute / WIDTH)
    frames.push({ pythonLine: lineIn(python.split('\n'), 'for minute in orders'), activeLine: L('for each order minute'), phase: 'read', message: `Read order minute ${minute}.`, row: snap(minute, null) })
    frames.push({ pythonLine: lineIn(python.split('\n'), 'interval = minute'), activeLine: L('find interval'), phase: 'bucket', message: `${minute} falls in interval ${interval} (${interval * WIDTH} to ${interval * WIDTH + WIDTH - 1}).`, row: snap(minute, interval) })
    counts[interval] += 1
    frames.push({ pythonLine: lineIn(python.split('\n'), 'counts[interval] += 1'), activeLine: L('add one to that interval'), phase: 'count', message: `Interval ${interval} now holds ${counts[interval]}.`, row: snap(minute, interval) })
  }
  frames.push({ pythonLine: lineIn(python.split('\n'), 'return counts'), activeLine: L('return the counters'), phase: 'done', message: `Counted ${orders.length} order${orders.length === 1 ? '' : 's'} across ${BUCKETS} intervals.`, row: snap(null, null) })
  return { input: orders, result: [...counts], frames }
}

export const code = `count orders in each 60-minute interval
  start ten interval counters at zero
  for each order minute
    find interval as minute div 60
    add one to that interval counter
  return the counters`.split('\n').map((text, index) => ({ line: index + 1, text: text.trim() }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
if (L('start ten interval') < 1 || L('return the counters') < 1) throw new Error('Pseudocode lookup failed')

export const python = `def count_orders_per_interval(orders):
    counts = [0] * 10
    for minute in orders:
        interval = minute // 60
        counts[interval] += 1
    return counts`

export const sql = `-- Teaching rule: order_minute holds minutes 0 to 599
SELECT FLOOR(order_minute / 60) AS interval_index, COUNT(*) AS order_count
FROM orders
GROUP BY interval_index
ORDER BY interval_index;`
