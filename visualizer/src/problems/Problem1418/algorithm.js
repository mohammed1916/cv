export const phases = [
  { id: 'read', label: 'Read orders', description: 'Count each order in its table row and food column, noting new tables and foods as they appear.' },
  { id: 'foods', label: 'Sort foods', description: 'Sort the food names alphabetically to make the column order.' },
  { id: 'tables', label: 'Sort tables', description: 'Sort the table numbers numerically, so table 10 comes after table 9.' },
  { id: 'fill', label: 'Fill rows', description: 'Read each table row, one count per food column, with zero for missing foods.' },
  { id: 'result', label: 'Result', description: 'Return the header row followed by one row per table.' },
]

export const python = `def display_table(orders):
    counts = defaultdict(lambda: defaultdict(int))
    foods = set()
    for customer, table, food in orders:
        counts[int(table)][food] += 1
        foods.add(food)
    food_list = sorted(foods)
    rows = [["Table"] + food_list]
    for t in sorted(counts):
        rows.append([str(t)] + [str(counts[t][f]) for f in food_list])
    return rows`

const pythonLines = python.split('\n')
export const code = `function displayTable(orders) {
  const counts = new Map(), foods = new Set()
  for (const [, table, food] of orders) {
    counts.set(table, { ...counts.get(table), [food]: (counts.get(table)?.[food] ?? 0) + 1 })
    foods.add(food)
  }
  const foodList = [...foods].sort()
  const rows = [['Table', ...foodList]]
  for (const t of [...counts.keys()].sort((a, b) => a - b)) rows.push([String(t), ...foodList.map(f => String(counts.get(t)[f] ?? 0))])
  return rows
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
export const pythonLineMap = { 1: 1, 2: 2, 3: 4, 4: 5, 5: 6, 6: 6, 7: 7, 8: 8, 9: 10, 10: 11, 11: 11 }

export function parseInput(text) {
  let value
  try { value = JSON.parse(text) } catch { throw new Error('Enter a JSON array of [customer, table, food] orders.') }
  if (!Array.isArray(value) || value.length < 1 || value.length > 500) throw new Error('Enter a JSON array of 1 to 500 orders.')
  value.forEach((order, i) => {
    if (!Array.isArray(order) || order.length !== 3 || order.some(part => typeof part !== 'string')) {
      throw new Error(`Order ${i + 1} must be three strings: [customer, table, food].`)
    }
    const [, table, food] = order
    if (!/^\d{1,4}$/.test(table) || Number(table) < 1) throw new Error(`Order ${i + 1}: the table must be a positive number such as "7".`)
    if (!/^[A-Za-z ]{1,20}$/.test(food)) throw new Error(`Order ${i + 1}: the food name must be 1 to 20 letters or spaces.`)
  })
  return value.map(([customer, table, food]) => [customer, String(Number(table)), food])
}

export function buildTrace(orders) {
  const frames = []
  const counts = {}
  const foods = []
  const tables = []
  let rows = []
  const push = (phase, activeLine, message, current = -1) => frames.push({
    phase, activeLine, message,
    snapshot: {
      current,
      foods: [...foods],
      tables: [...tables],
      counts: Object.fromEntries(Object.entries(counts).map(([t, row]) => [t, { ...row }])),
      rows: rows.map(row => [...row]),
    },
  })

  push('read', 3, `${orders.length} orders to tally. Tables and foods appear as they are first seen.`)
  orders.forEach(([, table, food], i) => {
    if (!counts[table]) { counts[table] = {}; tables.push(table) }
    if (!foods.includes(food)) foods.push(food)
    counts[table][food] = (counts[table][food] || 0) + 1
    push('read', 4, `Order ${i + 1}: table ${table} gets one more ${food}.`, i)
  })

  foods.sort()
  push('foods', 7, `Column order: ${foods.join(', ')}.`)
  tables.sort((a, b) => Number(a) - Number(b))
  push('tables', 9, `Row order: tables ${tables.join(', ')}.`)

  rows = [['Table', ...foods]]
  push('fill', 8, 'The header row lists every food in the sorted column order.')
  for (const t of tables) {
    rows.push([t, ...foods.map(f => String(counts[t][f] || 0))])
    push('fill', 9, `Table ${t}: ${foods.map(f => `${f} ${counts[t][f] || 0}`).join(', ')}.`)
  }
  push('result', 10, `Done: ${rows.length - 1} table rows.`)
  return { input: orders, result: rows, frames }
}
