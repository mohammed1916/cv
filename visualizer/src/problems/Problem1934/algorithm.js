// Knowledge-derived teaching model. The SQL, pandas code, sample rows and wording were written for this visualizer.
const SQL = `WITH totals AS (
  SELECT user_id,
    COUNT(*) AS total_events,
    SUM(CASE WHEN action = 'confirmed' THEN 1 ELSE 0 END) AS confirmed_events
  FROM Confirmations
  GROUP BY user_id
)
SELECT s.user_id,
  ROUND(COALESCE(t.confirmed_events * 1.0 / NULLIF(t.total_events, 0), 0), 2) AS confirmation_rate
FROM (SELECT DISTINCT user_id FROM Signups) s
LEFT JOIN totals t ON t.user_id = s.user_id
ORDER BY s.user_id`

export const code = SQL.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `import numpy as np
import pandas as pd

def confirmation_rate(signups, confirmations):
    totals = confirmations.groupby("user_id").agg(
        total=("action", "size"),
        confirmed=("action", lambda a: int((a == "confirmed").sum())),
    ).reset_index()
    result = signups[["user_id"]].drop_duplicates().merge(totals, on="user_id", how="left")
    result = result.fillna({"total": 0, "confirmed": 0})
    result["confirmation_rate"] = (result["confirmed"] / result["total"].replace(0, np.nan)).fillna(0).round(2)
    return result[["user_id", "confirmation_rate"]].sort_values("user_id")`

const sqlLines = code.map(entry => entry.text)
const pythonLines = python.split('\n')

function lineOf(lines, fragment) {
  const index = lines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`No line contains "${fragment}"`)
  return index + 1
}

const COLUMNS_EVENTS = ['user_id', 'time_stamp', 'action']
const COLUMNS_TOTALS = ['user_id', 'total_events', 'confirmed_events']
const COLUMNS_RATE = ['user_id', 'confirmation_rate']

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.Signups) || !Array.isArray(input.Confirmations)) throw new Error('Use an object with Signups and Confirmations lists.')
  if (input.Signups.length > 30 || input.Confirmations.length > 60) throw new Error('Keep at most 30 signups and 60 confirmation events.')
  const signed = new Set()
  for (const row of input.Signups) {
    if (!Number.isInteger(row.user_id)) throw new Error('Signups user_id is an integer.')
    if (signed.has(row.user_id)) throw new Error('Each user signs up once.')
    signed.add(row.user_id)
  }
  for (const row of input.Confirmations) {
    if (!Number.isInteger(row.user_id)) throw new Error('Confirmations user_id is an integer.')
    if (row.action !== 'confirmed' && row.action !== 'timeout') throw new Error('action is "confirmed" or "timeout".')
    if (typeof row.time_stamp !== 'string' || row.time_stamp.length === 0) throw new Error('time_stamp is non-empty text.')
  }
  return input
}

export function buildTrace(input) {
  const frames = []
  const push = (phase, sql, py, message, columns, tableRows) => frames.push({
    phase,
    activeLine: lineOf(sqlLines, sql),
    pythonLine: lineOf(pythonLines, py),
    message,
    table: { columns, rows: tableRows },
  })

  push('load', 'FROM Confirmations', 'def confirmation_rate', `Load ${input.Confirmations.length} confirmation events.`, COLUMNS_EVENTS, input.Confirmations)

  const totals = new Map()
  for (const row of input.Confirmations) {
    const entry = totals.get(row.user_id) || { total: 0, confirmed: 0 }
    entry.total += 1
    if (row.action === 'confirmed') entry.confirmed += 1
    totals.set(row.user_id, entry)
  }
  const totalRows = []
  for (const user of [...totals.keys()].sort((a, b) => a - b)) {
    const entry = totals.get(user)
    totalRows.push({ user_id: user, total_events: entry.total, confirmed_events: entry.confirmed })
    push('group', 'GROUP BY user_id', 'totals = confirmations.groupby', `User ${user}: ${entry.confirmed} of ${entry.total} events confirmed.`, COLUMNS_TOTALS, totalRows.map(row => ({ ...row })))
  }

  const signups = [...input.Signups].sort((a, b) => a.user_id - b.user_id)
  const rateRows = []
  for (const signup of signups) {
    const entry = totals.get(signup.user_id)
    const rate = entry && entry.total > 0 ? Math.round((entry.confirmed * 100) / entry.total) / 100 : 0
    rateRows.push({ user_id: signup.user_id, confirmation_rate: rate })
    push('rate', 'LEFT JOIN totals t', 'result = signups[["user_id"]]', `User ${signup.user_id} rate: ${rate}${entry ? '' : ' (no events, so zero)'}.`, COLUMNS_RATE, rateRows.map(row => ({ ...row })))
  }

  const result = rateRows.map(row => ({ ...row }))
  push('done', 'ORDER BY s.user_id', 'return result[', 'Signed-up users are listed with their confirmation rates.', COLUMNS_RATE, result.map(row => ({ ...row })))

  return { input, result, frames }
}

export const sampleInput = {
  Signups: [
    { user_id: 3, time_stamp: '2026-01-01 09:00:00' },
    { user_id: 7, time_stamp: '2026-01-01 09:05:00' },
    { user_id: 9, time_stamp: '2026-01-02 08:00:00' },
    { user_id: 12, time_stamp: '2026-01-03 10:00:00' },
  ],
  Confirmations: [
    { user_id: 3, time_stamp: '2026-01-01 09:10:00', action: 'confirmed' },
    { user_id: 3, time_stamp: '2026-01-01 09:20:00', action: 'timeout' },
    { user_id: 3, time_stamp: '2026-01-01 09:30:00', action: 'confirmed' },
    { user_id: 7, time_stamp: '2026-01-01 10:00:00', action: 'timeout' },
    { user_id: 7, time_stamp: '2026-01-01 10:05:00', action: 'timeout' },
    { user_id: 12, time_stamp: '2026-01-03 11:00:00', action: 'confirmed' },
    { user_id: 99, time_stamp: '2026-01-04 12:00:00', action: 'confirmed' },
  ],
}

export const sampleText = JSON.stringify(sampleInput)
