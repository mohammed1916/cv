// Knowledge-derived teaching version. The sample tables are invented for this visualization.
const SQL = `SELECT a.id AS p1,
  b.id AS p2,
  ABS(a.x_value - b.x_value) * ABS(a.y_value - b.y_value) AS area
FROM Points AS a
JOIN Points AS b
  ON a.id < b.id
WHERE a.x_value <> b.x_value AND a.y_value <> b.y_value
ORDER BY area DESC, p1 ASC, p2 ASC`

const PANDAS = `import itertools

def rectangles(points):
    found = []
    for a, b in itertools.combinations(points.sort_values("id").itertuples(), 2):
        if a.x_value != b.x_value and a.y_value != b.y_value:
            area = abs(a.x_value - b.x_value) * abs(a.y_value - b.y_value)
            found.append((a.id, b.id, area))
    found.sort(key=lambda r: (-r[2], r[0], r[1]))
    return found`

const SQL_LINES = SQL.split('\n')
const PY_LINES = PANDAS.split('\n')

function lineOf(lines, text) {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing line: ${text}`)
  return index + 1
}

export const sql = SQL
export const python = PANDAS
export const code = SQL_LINES.map((text, index) => ({ line: index + 1, text }))

const frame = (phase, sqlText, pyText, message, columns, rows) => ({
  phase,
  activeLine: lineOf(SQL_LINES, sqlText),
  pythonLine: lineOf(PY_LINES, pyText),
  message,
  columns: [...columns],
  rows: rows.map(row => ({ ...row })),
})

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.Points) || input.Points.length > 12) throw new Error('Use a Points list of at most 12 rows.')
  const ids = new Set()
  const Points = input.Points.map(row => {
    if (!row || !Number.isInteger(row.id) || !Number.isInteger(row.x_value) || !Number.isInteger(row.y_value)) {
      throw new Error('Each point needs integer id, x_value and y_value.')
    }
    if (ids.has(row.id)) throw new Error('Point ids must be unique.')
    ids.add(row.id)
    return { id: row.id, x_value: row.x_value, y_value: row.y_value }
  })
  return { Points }
}

export function buildTrace({ Points }) {
  const byId = [...Points].sort((a, b) => a.id - b.id)
  const columns = ['p1', 'p2', 'area']
  const frames = [frame('load', 'FROM Points', 'def rectangles', `Read ${Points.length} points. Each pair is taken once, with the smaller id first.`, ['id', 'x_value', 'y_value'], byId)]
  const found = []
  for (let i = 0; i < byId.length; i++) {
    for (let j = i + 1; j < byId.length; j++) {
      const a = byId[i]
      const b = byId[j]
      if (a.x_value !== b.x_value && a.y_value !== b.y_value) {
        const area = Math.abs(a.x_value - b.x_value) * Math.abs(a.y_value - b.y_value)
        found.push({ p1: a.id, p2: b.id, area })
        frames.push(frame('pair', 'WHERE a.x_value', 'if a.x_value != b.x_value',
          `Points ${a.id} and ${b.id} are opposite corners of a rectangle with area ${area}.`, columns, found))
      } else {
        frames.push(frame('pair', 'WHERE a.x_value', 'if a.x_value != b.x_value',
          `Points ${a.id} and ${b.id} share an x or y value, so they make no rectangle.`, columns, found))
      }
    }
  }
  found.sort((u, v) => v.area - u.area || u.p1 - v.p1 || u.p2 - v.p2)
  const result = found.map(({ p1, p2, area }) => ({ p1, p2, area }))
  frames.push(frame('sort', 'ORDER BY', 'found.sort', 'Sort by area, largest first, then by p1 and p2.', columns, result))
  frames.push(frame('done', 'SELECT a.id', 'return found', `Returned ${result.length} rectangles.`, columns, result))
  return { input: { Points }, result, frames }
}
