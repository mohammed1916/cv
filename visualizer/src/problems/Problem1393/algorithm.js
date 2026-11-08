// Knowledge-derived walkthrough written for this visualizer. The sample tables are invented.
const SQL_TEXT = `SELECT stock_name,
       SUM(CASE WHEN operation = 'Sell' THEN price ELSE -price END) AS capital_gain_loss
FROM Stocks
GROUP BY stock_name
ORDER BY stock_name`

export const sql = SQL_TEXT
export const code = SQL_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = `import pandas as pd

def capital_gain_loss(stocks):
    signed = stocks.assign(signed=stocks["price"].where(stocks["operation"] == "Sell", -stocks["price"]))
    totals = signed.groupby("stock_name", as_index=False)["signed"].sum()
    return totals.rename(columns={"signed": "capital_gain_loss"}).sort_values("stock_name")
`

export const phases = [
  { id: 'load', label: 'Trades', description: 'Read every buy and sell record.' },
  { id: 'sign', label: 'Signed prices', description: 'Sells add money, buys take it away.' },
  { id: 'group', label: 'Per stock', description: 'Add the signed prices for each stock.' },
  { id: 'done', label: 'Result', description: 'Show the rows the query returns.' },
]

export const sample = {
  Stocks: [
    { stock_name: 'Gadgets', operation: 'Buy', operation_day: 1, price: 800 },
    { stock_name: 'Tea', operation: 'Buy', operation_day: 2, price: 25 },
    { stock_name: 'Gadgets', operation: 'Sell', operation_day: 6, price: 5200 },
    { stock_name: 'Bikes', operation: 'Buy', operation_day: 9, price: 22000 },
    { stock_name: 'Tea', operation: 'Sell', operation_day: 4, price: 40 },
    { stock_name: 'Tea', operation: 'Buy', operation_day: 7, price: 35 },
    { stock_name: 'Tea', operation: 'Sell', operation_day: 8, price: 60 },
    { stock_name: 'Bikes', operation: 'Sell', operation_day: 12, price: 19000 },
  ],
}

export const examples = [
  { label: 'Three stocks', input: JSON.stringify(sample) },
  { label: "Single buy, a loss", input: "{\"Stocks\":[{\"stock_name\":\"Lamp\",\"operation\":\"Buy\",\"operation_day\":1,\"price\":10}]}" },
  { label: "Equal buy and sell nets zero", input: "{\"Stocks\":[{\"stock_name\":\"Rope\",\"operation\":\"Buy\",\"operation_day\":1,\"price\":30},{\"stock_name\":\"Rope\",\"operation\":\"Sell\",\"operation_day\":2,\"price\":30}]}" },
  { label: "Twelve records, four stocks", input: "{\"Stocks\":[{\"stock_name\":\"Lamp\",\"operation\":\"Buy\",\"operation_day\":1,\"price\":99999},{\"stock_name\":\"Rope\",\"operation\":\"Buy\",\"operation_day\":2,\"price\":99998},{\"stock_name\":\"Glue\",\"operation\":\"Buy\",\"operation_day\":3,\"price\":99997},{\"stock_name\":\"Kite\",\"operation\":\"Buy\",\"operation_day\":4,\"price\":99996},{\"stock_name\":\"Lamp\",\"operation\":\"Buy\",\"operation_day\":5,\"price\":99995},{\"stock_name\":\"Rope\",\"operation\":\"Buy\",\"operation_day\":6,\"price\":99994},{\"stock_name\":\"Glue\",\"operation\":\"Buy\",\"operation_day\":7,\"price\":99993},{\"stock_name\":\"Kite\",\"operation\":\"Buy\",\"operation_day\":8,\"price\":99992},{\"stock_name\":\"Lamp\",\"operation\":\"Sell\",\"operation_day\":9,\"price\":99991},{\"stock_name\":\"Rope\",\"operation\":\"Sell\",\"operation_day\":10,\"price\":99990},{\"stock_name\":\"Glue\",\"operation\":\"Sell\",\"operation_day\":11,\"price\":99989},{\"stock_name\":\"Kite\",\"operation\":\"Sell\",\"operation_day\":12,\"price\":99988}]}" },
  { label: "Long run: twelve random records", input: "{\"Stocks\":[{\"stock_name\":\"Kite\",\"operation\":\"Buy\",\"operation_day\":1,\"price\":567},{\"stock_name\":\"Glue\",\"operation\":\"Sell\",\"operation_day\":2,\"price\":209},{\"stock_name\":\"Kite\",\"operation\":\"Buy\",\"operation_day\":3,\"price\":165},{\"stock_name\":\"Kite\",\"operation\":\"Buy\",\"operation_day\":4,\"price\":758},{\"stock_name\":\"Lamp\",\"operation\":\"Sell\",\"operation_day\":5,\"price\":547},{\"stock_name\":\"Kite\",\"operation\":\"Buy\",\"operation_day\":6,\"price\":613},{\"stock_name\":\"Rope\",\"operation\":\"Buy\",\"operation_day\":7,\"price\":691},{\"stock_name\":\"Lamp\",\"operation\":\"Sell\",\"operation_day\":8,\"price\":707},{\"stock_name\":\"Lamp\",\"operation\":\"Buy\",\"operation_day\":9,\"price\":438},{\"stock_name\":\"Rope\",\"operation\":\"Buy\",\"operation_day\":10,\"price\":838},{\"stock_name\":\"Lamp\",\"operation\":\"Sell\",\"operation_day\":11,\"price\":507},{\"stock_name\":\"Lamp\",\"operation\":\"Buy\",\"operation_day\":12,\"price\":125}]}" },
]
export const inputLabel = 'Object with a Stocks list (operation is Buy or Sell)'
export const complexity = 'O(r log s) for r trade records and s stocks, dominated by the final sort. The visualization caps the table at 12 rows.'
export const reasoning = [
  'A sell adds its price, and a buy subtracts its price. Each record contributes one signed amount.',
  'Summing the signed amounts per stock gives the net result for that stock across all of its trades.',
  'The day of each trade does not change the total here, so the query does not need to order the records by day.',
]

const L = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`No SQL line contains "${key}".`)
  return index + 1
}
const P = key => {
  const index = python.split('\n').findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`No Python line contains "${key}".`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.Stocks)) throw new Error('Use an object with a Stocks list.')
  if (input.Stocks.length > 12) throw new Error('Keep Stocks to 12 rows.')
  for (const row of input.Stocks) {
    if (!['Buy', 'Sell'].includes(row.operation) || !Number.isInteger(row.price) || row.price < 0) throw new Error('Each record needs operation Buy or Sell and a non-negative integer price.')
  }
  return { Stocks: input.Stocks }
}

export function buildTrace({ Stocks }) {
  const frames = []
  const push = (phase, sqlKey, pyKey, message, caption, columns, rows) => frames.push({
    phase, activeLine: L(sqlKey), pythonLine: P(pyKey), message,
    view: { caption, columns, rows: rows.map(row => ({ ...row })) },
  })
  push('load', 'FROM Stocks', 'def capital_gain_loss', `Read ${Stocks.length} trade records.`, 'Stocks', ['stock_name', 'operation', 'price'], Stocks)
  const signed = Stocks.map(row => ({
    stock_name: row.stock_name,
    operation: row.operation,
    price: row.price,
    signed: row.operation === 'Sell' ? row.price : -row.price,
  }))
  push('sign', "SUM(CASE WHEN", 'signed = stocks', 'Give each sell a plus sign and each buy a minus sign.', 'Signed prices', ['stock_name', 'operation', 'price', 'signed'], signed)
  const names = [...new Set(Stocks.map(row => row.stock_name))].sort()
  const totals = names.map(name => ({
    stock_name: name,
    capital_gain_loss: signed.filter(row => row.stock_name === name).reduce((sum, row) => sum + row.signed, 0),
  }))
  push('group', 'GROUP BY stock_name', 'totals = signed.groupby', 'Add the signed prices for each stock.', 'Totals', ['stock_name', 'capital_gain_loss'], totals)
  const result = totals
  push('done', 'ORDER BY stock_name', 'return totals', `Return ${result.length} rows.`, 'Result', ['stock_name', 'capital_gain_loss'], result)
  return { input: { Stocks }, result, frames }
}
