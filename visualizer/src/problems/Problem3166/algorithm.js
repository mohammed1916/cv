// Knowledge-derived SQL walkthrough. The sample tables are invented; times are minutes from midnight.
// The average hourly rate and the tie-break (smallest lot_id) follow the walkthrough's own stated rule.
export const sql = `WITH stays AS (
  SELECT car_id, lot_id, fee_paid,
         exit_time - entry_time AS minutes
  FROM ParkingTransactions
),
car_totals AS (
  SELECT car_id, SUM(fee_paid) AS total_fee_paid, SUM(minutes) AS total_minutes
  FROM stays
  GROUP BY car_id
),
lot_time AS (
  SELECT car_id, lot_id, SUM(minutes) AS lot_minutes
  FROM stays
  GROUP BY car_id, lot_id
),
ranked_lots AS (
  SELECT car_id, lot_id,
         ROW_NUMBER() OVER (PARTITION BY car_id ORDER BY lot_minutes DESC, lot_id) AS rn
  FROM lot_time
)
SELECT t.car_id, t.total_fee_paid,
       ROUND(t.total_fee_paid * 60.0 / t.total_minutes, 2) AS average_hourly_fee,
       r.lot_id AS most_time_lot
FROM car_totals t
JOIN ranked_lots r ON r.car_id = t.car_id AND r.rn = 1
ORDER BY t.car_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def parking_summary(transactions):
    stays = transactions.assign(minutes=transactions["exit_time"] - transactions["entry_time"])
    totals = stays.groupby("car_id").agg(total_fee_paid=("fee_paid", "sum"), total_minutes=("minutes", "sum"))
    lot_minutes = stays.groupby(["car_id", "lot_id"])["minutes"].sum().reset_index()
    best = lot_minutes.sort_values(["car_id", "minutes", "lot_id"], ascending=[True, False, True])
    best = best.drop_duplicates("car_id")
    totals["average_hourly_fee"] = (totals["total_fee_paid"] * 60 / totals["total_minutes"]).round(2)
    merged = totals.reset_index().merge(best[["car_id", "lot_id"]], on="car_id")
    return merged.rename(columns={"lot_id": "most_time_lot"}).to_dict("records")`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

const frame = (phase, sqlKey, pyKey, message, columns, rows) => ({
  phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns, rows: rows.map(row => ({ ...row })),
})

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the parking transactions.' },
  { id: 'stay', label: 'Stays', description: 'Work out the minutes of each stay.' },
  { id: 'lot', label: 'Lots', description: 'Total the minutes per car and lot.' },
  { id: 'rank', label: 'Rank', description: 'Pick the lot with the most minutes.' },
  { id: 'total', label: 'Totals', description: 'Total the fee and the rate per car.' },
  { id: 'done', label: 'Result', description: 'Return one row per car.' },
]

const COLUMNS = ['transaction_id', 'car_id', 'lot_id', 'entry_time', 'exit_time', 'fee_paid']

function tableRows(input, name, columns) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 12) throw new Error(`${name} needs 1 to 12 rows.`)
  for (const row of rows) {
    if (!row || typeof row !== 'object' || columns.some(column => !(column in row))) throw new Error(`${name} rows need ${columns.join(', ')}.`)
  }
  return rows.map(row => Object.fromEntries(columns.map(column => [column, row[column]])))
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a ParkingTransactions table.')
  const ParkingTransactions = tableRows(input, 'ParkingTransactions', COLUMNS)
  for (const row of ParkingTransactions) {
    if (![row.transaction_id, row.car_id, row.lot_id, row.entry_time, row.exit_time].every(Number.isInteger)) throw new Error('IDs and times are integers.')
    if (row.exit_time <= row.entry_time || row.exit_time > 1440) throw new Error('exit_time is after entry_time and within one day.')
    if (typeof row.fee_paid !== 'number' || row.fee_paid < 0) throw new Error('fee_paid is a non-negative number.')
  }
  return { ParkingTransactions }
}

export function buildTrace(input) {
  const { ParkingTransactions } = input
  const frames = []
  frames.push(frame('load', 'FROM ParkingTransactions', 'def ', `Load ${ParkingTransactions.length} parking stays.`, COLUMNS, ParkingTransactions))

  const stays = ParkingTransactions.map(row => ({ ...row, minutes: row.exit_time - row.entry_time }))
  frames.push(frame('stay', 'exit_time - entry_time', 'stays = ', 'Each stay lasts exit time minus entry time, in minutes.', [...COLUMNS, 'minutes'], stays))

  const lotMap = new Map()
  for (const stay of stays) {
    const key = `${stay.car_id}|${stay.lot_id}`
    if (!lotMap.has(key)) lotMap.set(key, { car_id: stay.car_id, lot_id: stay.lot_id, lot_minutes: 0 })
    lotMap.get(key).lot_minutes += stay.minutes
  }
  const lots = [...lotMap.values()].sort((a, b) => a.car_id - b.car_id || a.lot_id - b.lot_id)
  frames.push(frame('lot', 'GROUP BY car_id, lot_id', 'lot_minutes =', 'Add the minutes of every stay in the same lot.', ['car_id', 'lot_id', 'lot_minutes'], lots))

  const carTotals = new Map()
  for (const stay of stays) {
    if (!carTotals.has(stay.car_id)) carTotals.set(stay.car_id, { car_id: stay.car_id, total_fee_paid: 0, total_minutes: 0 })
    const total = carTotals.get(stay.car_id)
    total.total_fee_paid += stay.fee_paid
    total.total_minutes += stay.minutes
  }

  const ranked = []
  const result = []
  for (const car of [...carTotals.values()].sort((a, b) => a.car_id - b.car_id)) {
    const candidates = lots.filter(lot => lot.car_id === car.car_id)
      .sort((a, b) => b.lot_minutes - a.lot_minutes || a.lot_id - b.lot_id)
    const top = candidates[0]
    ranked.push({ car_id: car.car_id, lot_id: top.lot_id, lot_minutes: top.lot_minutes })
    frames.push(frame('rank', 'ROW_NUMBER', 'best = lot_minutes', `Car ${car.car_id} spent the most time in lot ${top.lot_id}.`, ['car_id', 'lot_id', 'lot_minutes'], ranked))

    const rate = Math.round((car.total_fee_paid * 60 / car.total_minutes) * 100) / 100
    const row = { car_id: car.car_id, total_fee_paid: car.total_fee_paid, average_hourly_fee: rate, most_time_lot: top.lot_id }
    result.push(row)
    frames.push(frame('total', 'ROUND(', 'average_hourly_fee', `Car ${car.car_id}: ${car.total_fee_paid} fee over ${car.total_minutes} minutes is ${rate} per hour.`, ['car_id', 'total_fee_paid', 'average_hourly_fee', 'most_time_lot'], result))
  }
  frames.push(frame('done', 'ORDER BY t.car_id', 'return', `Return ${result.length} car row${result.length === 1 ? '' : 's'}.`, ['car_id', 'total_fee_paid', 'average_hourly_fee', 'most_time_lot'], result))
  return { input, result, frames }
}
