const MAX_ROWS = 24

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the Heights table.' },
  { id: 'order', label: 'Order', description: 'Window functions see the rows in id order.' },
  { id: 'left', label: 'Left peak', description: 'MAX(height) OVER (ORDER BY id) grows from the left.' },
  { id: 'right', label: 'Right peak', description: 'MAX(height) OVER (ORDER BY id DESC) grows from the right.' },
  { id: 'water', label: 'Water', description: 'Each bar holds LEAST(left, right) minus its height.' },
  { id: 'done', label: 'Result', description: 'SUM gives the single output row.' },
]

export const code = `read the Heights rows, ordered by id
  scanning left to right, set left_peak to the tallest height so far
  scanning right to left, set right_peak to the tallest height so far
  for each row
    the water level is the lower of left_peak and right_peak
    water on this bar is the level minus its height
  output the sum of all water as total_trapped_water`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const sql = `WITH RunningPeaks AS (
    SELECT
        height,
        MAX(height) OVER (ORDER BY id) AS left_peak,
        MAX(height) OVER (ORDER BY id DESC) AS right_peak
    FROM Heights
)
SELECT SUM(LEAST(left_peak, right_peak) - height) AS total_trapped_water
FROM RunningPeaks;
`

export const python = `def trapped_water(Heights):
    rows = [dict(row) for row in sorted(Heights, key=lambda row: row["id"])]
    peak = 0
    for row in rows:
        peak = max(peak, row["height"])
        row["left_peak"] = peak
    peak = 0
    for row in reversed(rows):
        peak = max(peak, row["height"])
        row["right_peak"] = peak
    total = 0
    for row in rows:
        total += min(row["left_peak"], row["right_peak"]) - row["height"]
    return [{"total_trapped_water": total}]
`

const lineOf = (lines, s) => {
  const index = lines.findIndex(text => text.includes(s))
  if (index < 0) throw new Error(`Code line missing: ${s}`)
  return index + 1
}
const pythonLines = python.trim().split('\n')
const L = s => lineOf(code.map(c => c.text), s)
const P = s => lineOf(pythonLines, s)

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a Heights table.')
  const rows = input.Heights
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > MAX_ROWS) throw new Error(`Heights has 1 to ${MAX_ROWS} rows here.`)
  for (const row of rows) {
    if (!row || typeof row !== 'object') throw new Error('Each row needs id and height.')
    if (!Number.isInteger(row.id)) throw new Error('Each id is an integer.')
    if (!Number.isInteger(row.height) || row.height < 0) throw new Error('Each height is a non-negative integer.')
  }
  const ids = rows.map(row => row.id).sort((a, b) => a - b)
  ids.forEach((id, i) => {
    if (i && id === ids[i - 1]) throw new Error(`id ${id} appears twice; id is the primary key.`)
    if (i && id !== ids[i - 1] + 1) throw new Error('The ids must be sequential, with no gaps.')
  })
  return { Heights: rows.map(({ id, height }) => ({ id, height })) }
}

export function buildTrace({ Heights }) {
  const frames = []
  const rows = [...Heights].sort((a, b) => a.id - b.id).map(row => ({ id: row.id, height: row.height }))
  const snap = () => rows.map(row => ({ ...row }))
  let total = 0
  frames.push({ phase: 'load', activeLine: L('read the Heights'), pythonLine: P('def trapped_water'), rows: Heights.map(row => ({ ...row })), at: -1, total: 0, showChart: false, message: `Read ${Heights.length} row${Heights.length === 1 ? '' : 's'} from Heights. A table has no built-in order.` })
  frames.push({ phase: 'order', activeLine: L('read the Heights'), pythonLine: P('sorted(Heights'), rows: snap(), at: -1, total: 0, showChart: true, message: 'Order by id: now each row is a bar in the landscape, one unit wide.' })
  let peak = 0
  rows.forEach((row, i) => {
    const raised = row.height > peak
    peak = Math.max(peak, row.height)
    row.left_peak = peak
    frames.push({ phase: 'left', activeLine: L('scanning left to right'), pythonLine: P('row["left_peak"] = peak'), rows: snap(), at: i, total: 0, showChart: true, message: raised ? `id ${row.id} is the tallest from the left so far: left_peak rises to ${peak}.` : `id ${row.id} (height ${row.height}) is below the peak: left_peak stays ${peak}.` })
  })
  peak = 0
  for (let i = rows.length - 1; i >= 0; i--) {
    const row = rows[i]
    const raised = row.height > peak
    peak = Math.max(peak, row.height)
    row.right_peak = peak
    frames.push({ phase: 'right', activeLine: L('scanning right to left'), pythonLine: P('row["right_peak"] = peak'), rows: snap(), at: i, total: 0, showChart: true, message: raised ? `id ${row.id} is the tallest from the right so far: right_peak rises to ${peak}.` : `id ${row.id} (height ${row.height}) is below the peak: right_peak stays ${peak}.` })
  }
  rows.forEach((row, i) => {
    row.level = Math.min(row.left_peak, row.right_peak)
    row.water = row.level - row.height
    total += row.water
    frames.push({ phase: 'water', activeLine: L('water on this bar'), pythonLine: P('total += min('), rows: snap(), at: i, total, showChart: true, message: `id ${row.id}: the lower peak is min(${row.left_peak}, ${row.right_peak}) = ${row.level}, minus height ${row.height} leaves ${row.water} unit${row.water === 1 ? '' : 's'}. Total ${total}.` })
  })
  frames.push({ phase: 'done', activeLine: L('output the sum'), pythonLine: P('return [{'), rows: snap(), at: -1, total, showChart: true, message: `The query returns one row: total_trapped_water = ${total}.` })
  return { input: { Heights }, result: [{ total_trapped_water: total }], frames }
}
