// Knowledge-derived SQL walkthrough. The sample tables are invented for this visualization.
export const phases = [
  { id: 'load', label: 'Load', description: 'Read the coffee shop rows.' },
  { id: 'order', label: 'Order', description: 'Walk the rows in id order.' },
  { id: 'carry', label: 'Carry', description: 'Keep the latest drink seen so far.' },
  { id: 'done', label: 'Result', description: 'Return every id with its filled drink.' },
]

export const sql = `SELECT c.id,
       COALESCE(c.drink, (
         SELECT p.drink
         FROM CoffeeShop p
         WHERE p.id < c.id AND p.drink IS NOT NULL
         ORDER BY p.id DESC
         LIMIT 1)) AS drink
FROM CoffeeShop c
ORDER BY c.id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def fill_previous_drink(coffee_shop):
    table = coffee_shop.sort_values("id").copy()
    table["drink"] = table["drink"].ffill()
    return table[["id", "drink"]]`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || !Array.isArray(input.CoffeeShop)) throw new Error('Use an object with a CoffeeShop array.')
  const rows = input.CoffeeShop
  if (rows.length < 1 || rows.length > 12) throw new Error('CoffeeShop needs 1 to 12 rows.')
  const seen = new Set()
  const cleaned = rows.map(row => {
    if (!row || typeof row !== 'object' || !Number.isInteger(row.id) || !(row.drink === null || typeof row.drink === 'string')) throw new Error('Each row needs an integer id and a drink string or null.')
    if (seen.has(row.id)) throw new Error('Each id appears once.')
    seen.add(row.id)
    return { id: row.id, drink: row.drink }
  }).sort((a, b) => a.id - b.id)
  if (cleaned[0].drink === null) throw new Error('The first row (lowest id) must have a drink.')
  return { CoffeeShop: cleaned }
}

export function buildTrace(input) {
  const rows = input.CoffeeShop
  const frames = []
  const snapshot = filled => rows.map((row, i) => ({ id: row.id, drink: row.drink ?? 'NULL', filled: filled[i] ?? '' }))
  const columns = ['id', 'drink', 'filled']
  frames.push({ phase: 'load', activeLine: SQL('FROM CoffeeShop c'), pythonLine: PY('def '), message: `Load ${rows.length} rows; ids are unique.`, columns, rows: snapshot([]) })
  frames.push({ phase: 'order', activeLine: SQL('ORDER BY c.id'), pythonLine: PY('sort_values'), message: 'Order the rows by id. The query defines the walk order by id, not by insertion.', columns, rows: snapshot([]) })

  const filled = []
  let carry = null
  rows.forEach((row, i) => {
    if (row.drink !== null) carry = row.drink
    filled.push(carry)
    const message = row.drink !== null
      ? `Row ${row.id} has ${row.drink}; it keeps its own drink.`
      : `Row ${row.id} is NULL; it takes ${carry} from the nearest earlier row.`
    frames.push({ phase: 'carry', activeLine: SQL(row.drink !== null ? 'COALESCE' : 'WHERE p.id'), pythonLine: PY('ffill'), message, columns, rows: snapshot(filled) })
  })

  const result = rows.map((row, i) => ({ id: row.id, drink: filled[i] }))
  frames.push({ phase: 'done', activeLine: SQL('ORDER BY c.id'), pythonLine: PY('return'), message: `Return ${result.length} rows with no NULL drinks.`, columns: ['id', 'drink'], rows: result.map(row => ({ ...row })) })
  return { input, result, frames }
}
