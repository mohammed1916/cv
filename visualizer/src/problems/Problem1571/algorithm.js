// Knowledge-derived SQL lesson. The sample tables are invented for this visualization.
export const sql = `select w.name as warehouse_name,
       sum(w.units * p.Width * p.Length * p.Height) as volume
from Warehouse w
join Products p on p.product_id = w.product_id
group by w.name
order by w.name`
export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = `def warehouse_volume(warehouse, products):
    merged = warehouse.merge(products, on='product_id')
    merged['cubic'] = merged['units'] * merged['Width'] * merged['Length'] * merged['Height']
    grouped = merged.groupby('name', as_index=False)['cubic'].sum()
    return grouped.rename(columns={'name': 'warehouse_name', 'cubic': 'volume'}).sort_values('warehouse_name')`
export const phases = [
  { id: 'load', label: 'Load', description: 'Read the Warehouse rows.' },
  { id: 'join', label: 'Join', description: 'Attach each product size to its stock line.' },
  { id: 'volume', label: 'Volume', description: 'Multiply units by width, length and height.' },
  { id: 'group', label: 'Sum', description: 'Add the volumes for each warehouse.' },
  { id: 'order', label: 'Order', description: 'Sort warehouses by name.' },
  { id: 'done', label: 'Result', description: 'Report one volume per warehouse.' },
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
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with warehouse and products lists.')
  if (!Array.isArray(input.warehouse) || input.warehouse.length > 12) throw new Error('warehouse is a list of at most 12 rows.')
  if (!Array.isArray(input.products) || input.products.length > 8) throw new Error('products is a list of at most 8 rows.')
  for (const w of input.warehouse) {
    if (typeof w.name !== 'string' || typeof w.product_id !== 'number' || typeof w.units !== 'number') throw new Error('Each warehouse row has name, product_id and units.')
  }
  for (const p of input.products) {
    if (typeof p.product_id !== 'number' || ![p.Width, p.Length, p.Height].every(n => Number.isInteger(n) && n > 0)) {
      throw new Error('Each product has product_id and whole-number Width, Length and Height above zero.')
    }
  }
  return input
}

export function buildTrace(input) {
  const frames = []
  const stock = input.warehouse.map(w => ({ ...w }))
  frames.push(frame('load', 'from Warehouse w', 'def warehouse_volume', stock, [], `Read ${stock.length} stock lines.`))
  const sizes = new Map(input.products.map(p => [p.product_id, p]))
  const joined = stock.map(w => {
    const size = sizes.get(w.product_id)
    if (!size) throw new Error(`No product ${w.product_id} for warehouse ${w.name}.`)
    return { name: w.name, product_id: w.product_id, units: w.units, Width: size.Width, Length: size.Length, Height: size.Height }
  })
  frames.push(frame('join', 'join Products p', 'merge(products', joined, [], 'Each stock line now carries its product size.'))
  const cubed = joined.map(r => ({ ...r, cubic: r.units * r.Width * r.Length * r.Height }))
  frames.push(frame('volume', 'sum(w.units', "merged['cubic'] =", cubed, [], 'Each stock line occupies units times the box volume.'))
  const sums = new Map()
  for (const row of cubed) sums.set(row.name, (sums.get(row.name) ?? 0) + row.cubic)
  const grouped = [...sums.entries()].map(([warehouse_name, volume]) => ({ warehouse_name, volume }))
  frames.push(frame('group', 'group by w.name', "groupby('name'", grouped, [], `Summed ${grouped.length} warehouses.`))
  const ordered = [...grouped].sort((a, b) => (a.warehouse_name < b.warehouse_name ? -1 : a.warehouse_name > b.warehouse_name ? 1 : 0))
  frames.push(frame('order', 'order by w.name', "sort_values('warehouse_name')", ordered, [], 'Sort warehouses by name.'))
  const result = ordered.map(row => ({ ...row }))
  frames.push(frame('done', 'select w.name', 'return grouped', result, result, `Returned ${result.length} warehouses.`))
  return { input, result, frames }
}
