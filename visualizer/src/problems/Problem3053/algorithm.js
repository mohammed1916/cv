// Knowledge-derived SQL walkthrough. The side lengths are invented for this visualization.
export const sql = `SELECT CASE
         WHEN A + B <= C OR A + C <= B OR B + C <= A THEN 'Not A Triangle'
         WHEN A = B AND B = C THEN 'Equilateral'
         WHEN A = B OR B = C OR A = C THEN 'Isosceles'
         ELSE 'Scalene'
       END AS triangle_type
FROM Triangles`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def classify(triangles):
    rows = []
    for _, t in triangles.iterrows():
        a, b, c = t["A"], t["B"], t["C"]
        if a + b <= c or a + c <= b or b + c <= a:
            kind = "Not A Triangle"
        elif a == b == c:
            kind = "Equilateral"
        elif a == b or b == c or a == c:
            kind = "Isosceles"
        else:
            kind = "Scalene"
        rows.append({"triangle_type": kind})
    return rows`
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
  { id: 'load', label: 'Load', description: 'Read the side lengths of each row.' },
  { id: 'check', label: 'Classify', description: 'Test the rows in order: invalid first, then equal sides.' },
  { id: 'done', label: 'Result', description: 'Return one label per row.' },
]

const COLUMNS = ['A', 'B', 'C']
const OUTPUT_COLUMNS = ['A', 'B', 'C', 'triangle_type']

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || !Array.isArray(input.Triangles)) {
    throw new Error('Use an object with a Triangles array.')
  }
  const rows = input.Triangles
  if (rows.length < 1 || rows.length > 12) throw new Error('Triangles needs 1 to 12 rows.')
  const Triangles = rows.map(row => {
    if (!row || typeof row !== 'object' || COLUMNS.some(column => !(column in row))) {
      throw new Error('Triangles rows need A, B and C.')
    }
    return { A: Number(row.A), B: Number(row.B), C: Number(row.C) }
  })
  return { Triangles }
}

export function buildTrace(input) {
  const { Triangles } = input
  const frames = []
  frames.push(frame('load', 'FROM Triangles', 'def classify', 'Read the side lengths of every row.', COLUMNS, Triangles))

  const classified = []
  for (const { A, B, C } of Triangles) {
    let kind
    let sqlKey
    let pyKey
    if (A + B <= C || A + C <= B || B + C <= A) {
      kind = 'Not A Triangle'
      sqlKey = 'WHEN A + B'
      pyKey = 'if a + b'
    } else if (A === B && B === C) {
      kind = 'Equilateral'
      sqlKey = 'WHEN A = B AND'
      pyKey = 'elif a == b == c'
    } else if (A === B || B === C || A === C) {
      kind = 'Isosceles'
      sqlKey = 'WHEN A = B OR'
      pyKey = 'elif a == b or'
    } else {
      kind = 'Scalene'
      sqlKey = 'ELSE'
      pyKey = 'else:'
    }
    classified.push({ A, B, C, triangle_type: kind })
    frames.push(frame('check', sqlKey, pyKey, `(${A}, ${B}, ${C}) is ${kind}.`, OUTPUT_COLUMNS, classified))
  }
  const result = classified.map(row => ({ triangle_type: row.triangle_type }))
  frames.push(frame('done', 'END AS triangle_type', 'return rows', `Return ${result.length} labels in input order.`, ['triangle_type'], result))
  return { input, result, frames }
}
