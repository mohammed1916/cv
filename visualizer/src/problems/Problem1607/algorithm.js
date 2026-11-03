// Knowledge-derived SQL lesson. The sample tables are invented for this visualization.
export const sql = `select s.seller_name
from Seller s
where not exists (
  select 1 from Orders o
  where o.seller_id = s.seller_id and year(o.sale_date) = 2020)
order by s.seller_name`
export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = `def idle_sellers(seller, orders):
    sold = orders[orders['sale_date'].str[:4] == '2020']['seller_id']
    idle = seller[~seller['seller_id'].isin(sold)]
    return idle[['seller_name']].sort_values('seller_name')`
export const phases = [
  { id: 'load', label: 'Load', description: 'Read the Seller rows.' },
  { id: 'year', label: 'Year', description: 'Count each seller orders dated in 2020.' },
  { id: 'filter', label: 'Filter', description: 'Keep sellers with no 2020 order.' },
  { id: 'order', label: 'Order', description: 'Sort by seller name.' },
  { id: 'done', label: 'Result', description: 'Report the idle sellers.' },
]

const sqlLine = text => {
  const hit = code.find(c => c.text.includes(text))
  if (!hit) throw new Error(`No SQL line contains "${text}".`)
  return hit.line
}
const pyLine = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`No Python line contains "${text}".`)
  return index + 1
}
const frame = (phase, sqlText, pyText, rows, output, message) => ({
  phase, activeLine: sqlLine(sqlText), pythonLine: pyLine(pyText),
  rows: rows.map(row => ({ ...row })), output: output.map(row => ({ ...row })), message,
})

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with seller and orders lists.')
  if (!Array.isArray(input.seller) || input.seller.length < 1 || input.seller.length > 8) throw new Error('seller is a list of 1 to 8 rows.')
  if (!Array.isArray(input.orders) || input.orders.length > 12) throw new Error('orders is a list of at most 12 rows.')
  for (const s of input.seller) {
    if (typeof s.seller_id !== 'number' || typeof s.seller_name !== 'string') throw new Error('Each seller has seller_id and seller_name.')
  }
  for (const o of input.orders) {
    if (typeof o.order_id !== 'number' || typeof o.seller_id !== 'number' || typeof o.sale_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(o.sale_date)) {
      throw new Error('Each order has order_id, seller_id and a YYYY-MM-DD sale_date.')
    }
  }
  return input
}

export function buildTrace(input) {
  const frames = []
  const sellers = input.seller.map(s => ({ ...s }))
  frames.push(frame('load', 'from Seller s', 'def idle_sellers', sellers, [], `Read ${sellers.length} sellers.`))
  const sold2020 = new Set(input.orders.filter(o => o.sale_date.startsWith('2020-')).map(o => o.seller_id))
  const counted = sellers.map(s => ({ seller_id: s.seller_id, seller_name: s.seller_name, orders_2020: input.orders.filter(o => o.seller_id === s.seller_id && o.sale_date.startsWith('2020-')).length }))
  frames.push(frame('year', 'year(o.sale_date) = 2020', "sold = orders[", counted, [], `${sold2020.size} sellers have a 2020 sale.`))
  const idle = counted.filter(s => !sold2020.has(s.seller_id))
  frames.push(frame('filter', 'where not exists', "idle = seller[~", idle, [], `${idle.length} sellers have no 2020 sale.`))
  const ordered = [...idle].sort((a, b) => (a.seller_name < b.seller_name ? -1 : a.seller_name > b.seller_name ? 1 : 0))
  frames.push(frame('order', 'order by s.seller_name', "sort_values('seller_name')", ordered, [], 'Sort by seller name.'))
  const result = ordered.map(s => ({ seller_name: s.seller_name }))
  frames.push(frame('done', 'select s.seller_name', 'return idle', result, result, `Returned ${result.length} sellers.`))
  return { input, result, frames }
}
