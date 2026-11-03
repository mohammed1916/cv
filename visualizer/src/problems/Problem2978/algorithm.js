// Knowledge-derived teaching model. The sample tables are invented for this visualization.
const COLS = ['X', 'Y']

export function snap(rows) {
  return rows.map(row => ({ ...row }))
}

export function lineOf(lines, text) {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing code line for: ${text}`)
  return index + 1
}

export function requireRows(input, name, columns) {
  const rows = input?.[name]
  if (!Array.isArray(rows) || rows.length === 0 || rows.length > 12) throw new Error(`${name} must be a list of 1 to 12 rows.`)
  rows.forEach((row, index) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error(`${name} row ${index + 1} must be an object.`)
    columns.forEach(column => { if (!(column in row)) throw new Error(`${name} row ${index + 1} needs ${column}.`) })
  })
  return rows
}

export const sql = `WITH pair_counts AS (
  SELECT X, Y, COUNT(*) AS times
  FROM Coordinates
  GROUP BY X, Y
)
SELECT a.X, a.Y
FROM pair_counts a
JOIN pair_counts b ON a.X = b.Y AND a.Y = b.X
WHERE a.X < a.Y OR (a.X = a.Y AND a.times > 1)
ORDER BY a.X, a.Y`
const sqlLines = sql.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))
export const python = `import pandas as pd

def symmetric_coordinates(coordinates):
    counts = coordinates.groupby(["X", "Y"]).size().rename("times").reset_index()
    mirror = counts.rename(columns={"X": "Y", "Y": "X"})
    joined = counts.merge(mirror, on=["X", "Y"], suffixes=("", "_mirror"))
    keep = (joined["X"] < joined["Y"]) | ((joined["X"] == joined["Y"]) & (joined["times"] > 1))
    return joined[keep][["X", "Y"]].sort_values(["X", "Y"])`
const pyLines = python.split('\n')
const L = text => lineOf(sqlLines, text)
const P = text => lineOf(pyLines, text)

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the coordinate rows.' },
  { id: 'group', label: 'Group', description: 'Count how often each ordered point appears.' },
  { id: 'match', label: 'Mirror', description: 'Look for the reversed point (Y, X) for each group.' },
  { id: 'keep', label: 'Keep', description: 'Keep one orientation with X < Y, or a diagonal point seen twice.' },
  { id: 'order', label: 'Order', description: 'Sort by X, then Y.' },
  { id: 'done', label: 'Result', description: 'Return the symmetric pairs.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  const rows = requireRows(input, 'Coordinates', COLS)
  rows.forEach((row, index) => {
    if (!Number.isInteger(row.X) || !Number.isInteger(row.Y)) throw new Error(`Coordinates row ${index + 1} needs whole-number X and Y.`)
  })
  return input
}

export function buildTrace(input) {
  const rows = input.Coordinates
  const frames = []
  const add = (phase, sqlText, pyText, message, columns, data) => frames.push({ phase, activeLine: L(sqlText), pythonLine: P(pyText), message, columns, rows: snap(data) })
  add('load', 'FROM Coordinates', 'def symmetric', `Read ${rows.length} coordinate rows.`, COLS, rows)
  const grouped = []
  for (const row of rows) {
    const hit = grouped.find(group => group.X === row.X && group.Y === row.Y)
    if (hit) hit.times += 1
    else grouped.push({ X: row.X, Y: row.Y, times: 1 })
  }
  add('group', 'GROUP BY X, Y', 'counts = ', `Group into ${grouped.length} distinct ordered points.`, ['X', 'Y', 'times'], grouped)
  const matched = grouped.flatMap(a => {
    const b = grouped.find(group => group.X === a.Y && group.Y === a.X)
    return b ? [{ X: a.X, Y: a.Y, times: a.times, mirror_times: b.times }] : []
  })
  add('match', 'JOIN pair_counts b', 'mirror = ', `${matched.length} groups have a reversed partner.`, ['X', 'Y', 'times', 'mirror_times'], matched)
  const kept = matched.filter(row => row.X < row.Y || (row.X === row.Y && row.times > 1))
  add('keep', 'WHERE a.X < a.Y', 'keep = ', `${kept.length} groups pass the orientation and diagonal rule.`, ['X', 'Y', 'times', 'mirror_times'], kept)
  const result = kept.map(row => ({ X: row.X, Y: row.Y })).sort((a, b) => a.X - b.X || a.Y - b.Y)
  add('order', 'ORDER BY a.X', 'return joined', 'Sort the pairs by X, then Y.', COLS, result)
  add('done', 'SELECT a.X', 'return joined', 'Return each symmetric pair once.', COLS, result)
  return { input, result, frames }
}
