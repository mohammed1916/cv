// Knowledge-derived teaching version. The sample tables are invented for this visualization.
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const SQL = [
  'SELECT i.item_category AS category,',
  ...DAYS.map((day, index) => `  SUM(CASE WHEN DAYNAME(o.order_date) = '${day}' THEN o.quantity ELSE 0 END) AS ${day}${index < DAYS.length - 1 ? ',' : ''}`),
  'FROM Items AS i',
  'LEFT JOIN Orders AS o ON o.item_id = i.item_id',
  'GROUP BY i.item_category',
  'ORDER BY i.item_category',
].join('\n')

const PANDAS = `import pandas as pd

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

def weekday_sales(orders, items):
    joined = orders.merge(items, on="item_id")
    joined["weekday"] = joined["order_date"].dt.day_name()
    table = joined.pivot_table(index="item_category", columns="weekday", values="quantity", aggfunc="sum", fill_value=0)
    table = table.reindex(index=sorted(items["item_category"].unique()), columns=DAYS, fill_value=0)
    return table.reset_index().rename(columns={"item_category": "category"})`

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

// 2020-06-29 is a Monday; getUTCDay() counts from Sunday, so shift it to start at Monday.
function weekdayName(isoDate) {
  return DAYS[(new Date(`${isoDate}T00:00:00Z`).getUTCDay() + 6) % 7]
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.Items) || !Array.isArray(input.Orders)) throw new Error('Use Items and Orders lists.')
  if (input.Items.length > 12 || input.Orders.length > 20) throw new Error('Use at most 12 items and 20 orders.')
  const Items = input.Items.map(row => {
    if (!row || !Number.isInteger(row.item_id) || typeof row.item_category !== 'string') throw new Error('Each item needs an integer item_id and an item_category.')
    return { item_id: row.item_id, item_name: String(row.item_name ?? ''), item_category: row.item_category }
  })
  const Orders = input.Orders.map(row => {
    if (!row || !Number.isInteger(row.order_id) || !Number.isInteger(row.item_id) || !Number.isInteger(row.quantity) || row.quantity < 0) {
      throw new Error('Each order needs integer order_id, item_id and a non-negative quantity.')
    }
    if (typeof row.order_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(row.order_date) || Number.isNaN(Date.parse(`${row.order_date}T00:00:00Z`))) {
      throw new Error('order_date uses YYYY-MM-DD.')
    }
    return { order_id: row.order_id, order_date: row.order_date, item_id: row.item_id, quantity: row.quantity }
  })
  return { Items, Orders }
}

export function buildTrace({ Items, Orders }) {
  const category = new Map(Items.map(row => [row.item_id, row.item_category]))
  const frames = [frame('load', 'FROM Items AS i', 'def weekday_sales', `Read ${Items.length} items; their categories are the output rows.`, ['item_id', 'item_name', 'item_category'], Items)]
  const tagged = []
  for (const order of Orders) {
    const name = category.get(order.item_id)
    if (name === undefined) throw new Error(`Order ${order.order_id} names an unknown item.`)
    const weekday = weekdayName(order.order_date)
    tagged.push({ order_id: order.order_id, order_date: order.order_date, weekday, category: name, quantity: order.quantity })
    frames.push(frame('weekday', 'DAYNAME', 'joined["weekday"]',
      `Order ${order.order_id} (${order.order_date}, ${weekday}) adds ${order.quantity} to ${name}.`,
      ['order_id', 'order_date', 'weekday', 'category', 'quantity'], tagged))
  }
  const categories = [...new Set(Items.map(row => row.item_category))].sort()
  const result = []
  for (const name of categories) {
    const row = { category: name }
    for (const day of DAYS) {
      row[day] = tagged.filter(entry => entry.category === name && entry.weekday === day).reduce((sum, entry) => sum + entry.quantity, 0)
    }
    result.push(row)
    frames.push(frame('pivot', 'GROUP BY', 'reindex(index',
      `${name} gets one column per weekday; days without orders stay 0.`, ['category', ...DAYS], result))
  }
  frames.push(frame('done', 'ORDER BY', 'return table', `Returned ${result.length} categories.`, ['category', ...DAYS], result))
  return { input: { Items, Orders }, result, frames }
}
