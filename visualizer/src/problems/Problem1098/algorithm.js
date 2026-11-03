// Knowledge-derived SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `SELECT b.book_id, b.name
FROM Books b
LEFT JOIN Orders o ON o.book_id = b.book_id
  AND o.dispatch_date > '2018-06-23' AND o.dispatch_date <= '2019-06-23'
WHERE b.available_from <= '2019-05-23'
GROUP BY b.book_id, b.name
HAVING COALESCE(SUM(o.quantity), 0) < 10
ORDER BY b.book_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def unpopular(books, orders):
    window = orders[(orders["dispatch_date"] > "2018-06-23") & (orders["dispatch_date"] <= "2019-06-23")]
    sold = window.groupby("book_id")["quantity"].sum()
    books = books[books["available_from"] <= "2019-05-23"].copy()
    books["sold"] = books["book_id"].map(sold).fillna(0)
    kept = books[books["sold"] < 10]
    return kept[["book_id", "name"]].to_dict("records")`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

const frame = (phase, sqlKey, pyKey, message, columns, rows, extra = {}) => ({
  phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns, rows: rows.map(row => ({ ...row })), ...extra,
})

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the books.' },
  { id: 'window', label: 'Window', description: 'Add the copies dispatched in the year before the reference date.' },
  { id: 'filter', label: 'Filter', description: 'Check availability and the sales limit.' },
  { id: 'done', label: 'Result', description: 'Output the books that pass both checks.' },
]

export const inputLabel = 'Object with Books and Orders tables'
export const complexity = 'O(b + o) with one pass over the orders for the window total. The visualizer caps each table at 12 rows.'
export const examples = [{
  label: 'Sample',
  input: '{"Books":[{"book_id":1,"name":"Atlas","available_from":"2018-01-01"},{"book_id":2,"name":"Blue Notes","available_from":"2019-05-01"},{"book_id":3,"name":"Cedar","available_from":"2019-06-20"},{"book_id":4,"name":"Dune Path","available_from":"2017-03-01"},{"book_id":5,"name":"Clay Pot","available_from":"2018-02-02"}],"Orders":[{"order_id":1,"book_id":1,"quantity":4,"dispatch_date":"2018-08-01"},{"order_id":2,"book_id":1,"quantity":5,"dispatch_date":"2019-02-14"},{"order_id":3,"book_id":2,"quantity":3,"dispatch_date":"2019-01-03"},{"order_id":4,"book_id":4,"quantity":12,"dispatch_date":"2019-05-02"},{"order_id":5,"book_id":4,"quantity":1,"dispatch_date":"2018-06-20"},{"order_id":6,"book_id":3,"quantity":2,"dispatch_date":"2019-06-01"}]}',
}]

function tableRows(input, name, columns) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 12) throw new Error(`${name} needs 1 to 12 rows.`)
  for (const row of rows) {
    if (!row || typeof row !== 'object' || columns.some(column => !(column in row))) throw new Error(`${name} rows need ${columns.join(', ')}.`)
  }
  return rows.map(row => Object.fromEntries(columns.map(column => [column, row[column]])))
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with Books and Orders tables.')
  return {
    Books: tableRows(input, 'Books', ['book_id', 'name', 'available_from']),
    Orders: tableRows(input, 'Orders', ['book_id', 'quantity', 'dispatch_date']),
  }
}

// Reading used here: the reference date is 2019-06-23, the sales window is the year after 2018-06-23 up to and including the reference date,
// and "available for at least one month" means available_from is on or before 2019-05-23.
const WINDOW_START = '2018-06-23'
const WINDOW_END = '2019-06-23'
const AVAILABLE_BY = '2019-05-23'

export function buildTrace(input) {
  const { Books, Orders } = input
  const frames = []
  frames.push(frame('load', 'FROM Books b', 'def ', 'Read the books.', ['book_id', 'name', 'available_from'], Books))

  const inWindow = Orders.filter(order => order.dispatch_date > WINDOW_START && order.dispatch_date <= WINDOW_END)
  const rows = []
  const result = []
  for (const book of Books) {
    const sold = inWindow.filter(order => order.book_id === book.book_id).reduce((total, order) => total + order.quantity, 0)
    rows.push({ book_id: book.book_id, name: book.name, available_from: book.available_from, sold_in_window: sold })
    frames.push(frame('window', 'AND o.dispatch_date', 'window =', `Book ${book.book_id} sold ${sold} copies in the window.`, ['book_id', 'name', 'sold_in_window'], rows))

    const available = book.available_from <= AVAILABLE_BY
    const ok = available && sold < 10
    rows[rows.length - 1].kept = ok ? 'yes' : 'no'
    if (ok) result.push({ book_id: book.book_id, name: book.name })
    const reason = !available ? 'is not available for a month' : sold < 10 ? 'passes the sales limit' : 'sold ten or more copies'
    frames.push(frame('filter', 'WHERE b.available_from', 'books = books', `Book ${book.book_id} ${reason}.`, ['book_id', 'name', 'sold_in_window', 'kept'], rows))
  }
  result.sort((a, b) => a.book_id - b.book_id)
  frames.push(frame('done', 'ORDER BY', 'return', `Return ${result.length} book${result.length === 1 ? '' : 's'}.`, ['book_id', 'name'], result))
  return { input, result, frames }
}
