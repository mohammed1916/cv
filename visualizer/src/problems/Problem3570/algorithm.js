// Knowledge-derived teaching variant (not the official statement).
const SQL = `WITH outstanding AS (
  SELECT book_id, COUNT(*) AS out_count
  FROM borrowing_records
  WHERE return_date IS NULL
  GROUP BY book_id
)
SELECT b.book_id, b.title
FROM library_books b
JOIN outstanding o ON o.book_id = b.book_id
WHERE o.out_count >= b.total_copies
ORDER BY b.book_id;`

const PYTHON = `def books_out_of_stock(library_books, borrowing_records):
    open_loans = borrowing_records[borrowing_records.return_date.isna()]
    counts = open_loans.groupby('book_id').size().rename('out_count')
    joined = library_books.join(counts, on='book_id')
    joined['out_count'] = joined.out_count.fillna(0)
    result = joined[joined.out_count >= joined.total_copies]
    return result[['book_id', 'title']].sort_values('book_id')`

export const code = SQL.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = PYTHON
const pyLines = PYTHON.split('\n')

function at(text) {
  const found = code.find(line => line.text.includes(text))
  if (!found) throw new Error(`Missing SQL line: ${text}`)
  return found.line
}

function pyAt(text) {
  const index = pyLines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing Python line: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.library_books) || !Array.isArray(input.borrowing_records)) {
    throw new Error('Use an object with library_books and borrowing_records lists.')
  }
  if (input.library_books.length > 8 || input.borrowing_records.length > 16) throw new Error('Use at most 8 books and 16 borrowing records.')
  const books = new Set()
  for (const row of input.library_books) {
    if (!Number.isInteger(row.book_id) || typeof row.title !== 'string' || !Number.isInteger(row.total_copies) || row.total_copies < 1) {
      throw new Error('Each book needs an integer book_id, a title and at least one copy.')
    }
    books.add(row.book_id)
  }
  for (const row of input.borrowing_records) {
    if (!Number.isInteger(row.record_id) || !books.has(row.book_id)) throw new Error('Each borrowing record needs an integer record_id and a known book_id.')
    if (typeof row.borrow_date !== 'string') throw new Error('borrow_date is text such as 2024-01-01.')
    if (row.return_date !== null && typeof row.return_date !== 'string') throw new Error('return_date is text or null for a book still out.')
  }
  return {
    library_books: input.library_books.map(row => ({ ...row })),
    borrowing_records: input.borrowing_records.map(row => ({ ...row, return_date: row.return_date ?? null })),
  }
}

export function buildTrace(input) {
  const { library_books: books, borrowing_records: records } = input
  const frames = []
  const step = (phase, sqlKey, pyKey, message, rows, result = []) => frames.push({
    phase, activeLine: at(sqlKey), pythonLine: pyAt(pyKey), message,
    rows: rows.map(row => ({ ...row })), result: result.map(row => ({ ...row })),
  })

  step('load', 'FROM borrowing_records', 'def books_out_of_stock', `Load ${books.length} books and ${records.length} borrowing records.`, records)

  const open = records.filter(row => row.return_date === null)
  step('filter', 'WHERE return_date IS NULL', 'open_loans = ', `Keep the ${open.length} records with no return date.`, open)

  const counts = new Map(books.map(book => [book.book_id, open.filter(row => row.book_id === book.book_id).length]))
  for (const book of books) {
    const own = open.filter(row => row.book_id === book.book_id)
    step('count', 'GROUP BY book_id', 'counts = ',
      `Book ${book.book_id} (${book.title}) has ${counts.get(book.book_id)} open loan${counts.get(book.book_id) === 1 ? '' : 's'}.`, own)
  }

  const result = []
  for (const book of books) {
    const out = counts.get(book.book_id)
    const exhausted = out >= book.total_copies
    if (exhausted) result.push({ book_id: book.book_id, title: book.title })
    step('compare', 'WHERE o.out_count >= b.total_copies', 'result = ',
      `${book.title}: ${out} out against ${book.total_copies} cop${book.total_copies === 1 ? 'y' : 'ies'}${exhausted ? ', so no copies are available.' : ', so copies remain.'}`,
      open.filter(row => row.book_id === book.book_id), result)
  }

  result.sort((a, b) => a.book_id - b.book_id)
  step('output', 'ORDER BY b.book_id', 'return result[', `Return ${result.length} books with no available copies.`, open, result)
  return { input: { library_books: books, borrowing_records: records }, result, frames }
}
