// Knowledge-derived teaching version. The sample tables are invented for this visualization.
const SQL = `SELECT SUM(b.apple_count + COALESCE(c.apple_count, 0)) AS apple_count,
       SUM(b.orange_count + COALESCE(c.orange_count, 0)) AS orange_count
FROM Boxes AS b
LEFT JOIN Chests AS c ON b.chest_id = c.chest_id`

const PANDAS = `import pandas as pd

def fruit_totals(boxes, chests):
    merged = boxes.merge(chests, on="chest_id", how="left", suffixes=("", "_chest"))
    apples = merged["apple_count"] + merged["apple_count_chest"].fillna(0)
    oranges = merged["orange_count"] + merged["orange_count_chest"].fillna(0)
    return pd.DataFrame({"apple_count": [apples.sum()], "orange_count": [oranges.sum()]})`

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

const isCount = value => Number.isInteger(value) && value >= 0

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.Boxes) || !Array.isArray(input.Chests) || input.Boxes.length > 12 || input.Chests.length > 12) {
    throw new Error('Use Boxes and Chests lists of at most 12 rows each.')
  }
  const Chests = input.Chests.map(row => {
    if (!row || !Number.isInteger(row.chest_id) || !isCount(row.apple_count) || !isCount(row.orange_count)) {
      throw new Error('Each chest needs an integer chest_id and non-negative apple_count and orange_count.')
    }
    return { chest_id: row.chest_id, apple_count: row.apple_count, orange_count: row.orange_count }
  })
  if (new Set(Chests.map(chest => chest.chest_id)).size !== Chests.length) throw new Error('Chest ids must be unique.')
  const Boxes = input.Boxes.map(row => {
    if (!row || !Number.isInteger(row.box_id) || !(row.chest_id === null || Number.isInteger(row.chest_id)) || !isCount(row.apple_count) || !isCount(row.orange_count)) {
      throw new Error('Each box needs an integer box_id, a chest_id or null, and non-negative apple_count and orange_count.')
    }
    return { box_id: row.box_id, chest_id: row.chest_id, apple_count: row.apple_count, orange_count: row.orange_count }
  })
  return { Boxes, Chests }
}

export function buildTrace({ Boxes, Chests }) {
  const boxColumns = ['box_id', 'chest_id', 'apple_total', 'orange_total']
  const totalColumns = ['apple_count', 'orange_count']
  const chestById = new Map(Chests.map(chest => [chest.chest_id, chest]))
  const own = Boxes.map(box => ({ box_id: box.box_id, chest_id: box.chest_id, apple_total: box.apple_count, orange_total: box.orange_count }))
  const frames = [frame('load', 'FROM Boxes', 'def fruit_totals', `Read ${Boxes.length} boxes and ${Chests.length} chests. Each box starts with its own fruit.`, boxColumns, own)]
  const joined = []
  let apples = 0
  let oranges = 0
  for (const box of Boxes) {
    const chest = box.chest_id === null ? undefined : chestById.get(box.chest_id)
    const apple_total = box.apple_count + (chest ? chest.apple_count : 0)
    const orange_total = box.orange_count + (chest ? chest.orange_count : 0)
    joined.push({ box_id: box.box_id, chest_id: box.chest_id, apple_total, orange_total })
    apples += apple_total
    oranges += orange_total
    frames.push(frame('join', 'LEFT JOIN Chests', 'merged = ',
      `Box ${box.box_id} contributes ${apple_total} apples and ${orange_total} oranges${chest ? ', including its chest' : ' and has no chest'}.`,
      boxColumns, joined))
  }
  const result = [{ apple_count: apples, orange_count: oranges }]
  frames.push(frame('done', 'SELECT SUM(b.apple_count', 'return pd.DataFrame', `Totals: ${apples} apples and ${oranges} oranges.`, totalColumns, result))
  return { input: { Boxes, Chests }, result, frames }
}
