// Knowledge-derived teaching version. The sample tables are invented for this visualization.
const SQL = `SELECT CONCAT(a.x_value, ',', a.y_value) AS p1,
  CONCAT(b.x_value, ',', b.y_value) AS p2,
  ABS(a.x_value - b.x_value) * ABS(a.y_value - b.y_value) AS area
FROM Points AS a
JOIN Points AS b
  ON (a.x_value, a.y_value) < (b.x_value, b.y_value)
WHERE a.x_value <> b.x_value AND a.y_value <> b.y_value
ORDER BY area DESC, a.x_value, a.y_value, b.x_value, b.y_value`

const PANDAS = `import itertools

def rectangles(points):
    pts = sorted(zip(points["x_value"], points["y_value"]))
    found = []
    for (x1, y1), (x2, y2) in itertools.combinations(pts, 2):
        if x1 != x2 and y1 != y2:
            found.append((-abs(x1 - x2) * abs(y1 - y2), x1, y1, x2, y2))
    found.sort()
    return [(f"{x1},{y1}", f"{x2},{y2}", -a) for a, x1, y1, x2, y2 in found]`

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

const label = point => `${point.x},${point.y}`

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.Points) || input.Points.length > 12) throw new Error('Use a Points list of at most 12 rows.')
  const Points = input.Points.map(row => {
    if (!row || !Number.isInteger(row.id) || !Number.isInteger(row.x_value) || !Number.isInteger(row.y_value)) {
      throw new Error('Each point needs integer id, x_value and y_value.')
    }
    return { id: row.id, x_value: row.x_value, y_value: row.y_value }
  })
  return { Points }
}

export function buildTrace({ Points }) {
  const pts = Points
    .map(row => ({ x: row.x_value, y: row.y_value }))
    .sort((a, b) => a.x - b.x || a.y - b.y)
  const columns = ['p1', 'p2', 'area']
  const frames = [frame('load', 'FROM Points', 'def rectangles', `Read ${Points.length} points, sorted by x then y.`, ['id', 'x_value', 'y_value'], Points)]
  const found = []
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const a = pts[i]
      const b = pts[j]
      if (a.x !== b.x && a.y !== b.y) {
        const area = Math.abs(a.x - b.x) * Math.abs(a.y - b.y)
        found.push({ p1: label(a), p2: label(b), area, x1: a.x, y1: a.y, x2: b.x, y2: b.y })
        frames.push(frame('pair', 'WHERE a.x_value', 'if x1 != x2',
          `(${label(a)}) and (${label(b)}) differ in both coordinates, area ${area}.`, columns, found))
      } else {
        frames.push(frame('pair', 'WHERE a.x_value', 'if x1 != x2',
          `(${label(a)}) and (${label(b)}) share a coordinate, so they give no rectangle.`, columns, found))
      }
    }
  }
  found.sort((u, v) => v.area - u.area || u.x1 - v.x1 || u.y1 - v.y1 || u.x2 - v.x2 || u.y2 - v.y2)
  const result = found.map(({ p1, p2, area }) => ({ p1, p2, area }))
  frames.push(frame('sort', 'ORDER BY', 'found.sort()', 'Sort by area, largest first, then by the corner coordinates.', columns, result))
  frames.push(frame('done', 'SELECT CONCAT', 'return [', `Returned ${result.length} rectangles.`, columns, result))
  return { input: { Points }, result, frames }
}
