// Teaching SQL walkthrough. The topping rows are invented for this visualization.
export const sql = `SELECT CONCAT(a.topping_name, ',', b.topping_name, ',', c.topping_name) AS pizza,
       a.cost + b.cost + c.cost AS total_cost
FROM Toppings a
JOIN Toppings b ON a.topping_name < b.topping_name
JOIN Toppings c ON b.topping_name < c.topping_name
ORDER BY total_cost DESC, pizza ASC`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `from itertools import combinations

def pizza_costs(toppings):
    names = sorted(toppings["topping_name"])
    cost = dict(zip(toppings["topping_name"], toppings["cost"]))
    rows = []
    for trio in combinations(names, 3):
        pizza = ",".join(trio)
        total = sum(cost[name] for name in trio)
        rows.append({"pizza": pizza, "total_cost": total})
    return sorted(rows, key=lambda r: (-r["total_cost"], r["pizza"]))`
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
  { id: 'load', label: 'Load', description: 'Read the toppings and their costs.' },
  { id: 'pairs', label: 'Order', description: 'Sort the topping names so each trio is listed once.' },
  { id: 'combine', label: 'Combine', description: 'Build each three-topping pizza and total its cost.' },
  { id: 'done', label: 'Result', description: 'Sort by total cost (highest first), then by pizza name.' },
]

const COLUMNS = ['topping_name', 'cost']
const PIZZA_COLUMNS = ['pizza', 'total_cost']

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || !Array.isArray(input.Toppings)) {
    throw new Error('Use an object with a Toppings array.')
  }
  const rows = input.Toppings
  if (rows.length < 1 || rows.length > 12) throw new Error('Toppings needs 1 to 12 rows.')
  const seen = new Set()
  const Toppings = rows.map(row => {
    if (!row || typeof row !== 'object' || COLUMNS.some(column => !(column in row))) {
      throw new Error('Toppings rows need topping_name and cost.')
    }
    if (seen.has(row.topping_name)) throw new Error('topping_name must be unique.')
    seen.add(row.topping_name)
    return { topping_name: String(row.topping_name), cost: Number(row.cost) }
  })
  return { Toppings }
}

export function buildTrace(input) {
  const { Toppings } = input
  const frames = []
  frames.push(frame('load', 'FROM Toppings', 'def pizza', 'Read every topping and its cost.', COLUMNS, Toppings))

  const names = [...Toppings].sort((a, b) => (a.topping_name < b.topping_name ? -1 : a.topping_name > b.topping_name ? 1 : 0))
  frames.push(frame('pairs', 'JOIN Toppings b', 'names =', 'Names are in alphabetical order, so each trio is taken once.', COLUMNS, names))

  const combos = []
  for (let i = 0; i < names.length; i += 1) {
    for (let j = i + 1; j < names.length; j += 1) {
      for (let k = j + 1; k < names.length; k += 1) {
        const trio = [names[i], names[j], names[k]]
        const pizza = trio.map(row => row.topping_name).join(',')
        const total = trio.reduce((sum, row) => sum + row.cost, 0)
        combos.push({ pizza, total_cost: total })
        frames.push(frame('combine', 'JOIN Toppings c', 'trio in', `${pizza} costs ${total}.`, PIZZA_COLUMNS, combos))
      }
    }
  }

  const result = combos
    .map(row => ({ ...row }))
    .sort((a, b) => (b.total_cost - a.total_cost) || (a.pizza < b.pizza ? -1 : a.pizza > b.pizza ? 1 : 0))
  frames.push(frame('done', 'ORDER BY', 'return sorted', `Return ${result.length} pizzas, most expensive first.`, PIZZA_COLUMNS, result))
  return { input, result, frames }
}
