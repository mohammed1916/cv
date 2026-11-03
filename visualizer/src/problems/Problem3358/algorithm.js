// Knowledge-derived teaching model (not the official statement): return books whose rating is NULL,
// not books whose rating is zero. Output columns and order here are this teaching version's choices.

const SQL_LINES = [
  'SELECT book_id, title',
  'FROM Books',
  'WHERE rating IS NULL',
  'ORDER BY book_id;',
]

const PY_LINES = [
  'def books_with_null_ratings(books):',
  '    df = pd.DataFrame(books)',
  "    picked = df[df['rating'].isna()]",
  "    picked = picked.sort_values('book_id')",
  "    return picked[['book_id', 'title']].to_dict('records')",
]

export const sql = SQL_LINES.join('\n')
export const code = SQL_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

export const phases = [
  { id: 'load', label: 'Load', description: 'Read every book row.' },
  { id: 'check', label: 'Check', description: 'Test each rating for NULL, not for zero.' },
  { id: 'order', label: 'Order', description: 'Sort the kept rows by book_id.' },
  { id: 'output', label: 'Result', description: 'Show the result rows.' },
]

function lineOf(lines, fragment) {
  const index = lines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`No line contains "${fragment}"`)
  return index + 1
}
const sqlAt = fragment => lineOf(SQL_LINES, fragment)
const pyAt = fragment => lineOf(PY_LINES, fragment)

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.books)) throw new Error('Use an object with a books array.')
  if (input.books.length > 12) throw new Error('Use at most 12 books for the teaching view.')
  const ids = new Set()
  for (const row of input.books) {
    if (!Number.isInteger(row.book_id) || ids.has(row.book_id)) throw new Error('Each book_id must be a unique integer.')
    ids.add(row.book_id)
    if (typeof row.title !== 'string' || typeof row.author !== 'string') throw new Error('title and author are text.')
    if (!Number.isInteger(row.published_year)) throw new Error('published_year is an integer.')
    if (row.rating !== null && (typeof row.rating !== 'number' || row.rating < 0 || row.rating > 5)) throw new Error('rating is null or a number from 0 to 5.')
  }
  return { books: input.books.map(row => ({ ...row })) }
}

export function buildTrace({ books }) {
  const frames = []
  const snap = rows => rows.map(row => ({ ...row }))
  frames.push({ phase: 'load', activeLine: sqlAt('FROM Books'), pythonLine: pyAt('DataFrame'), message: `Loaded ${books.length} books.`, rows: snap(books) })

  const kept = []
  for (const row of books) {
    const isNull = row.rating === null
    if (isNull) kept.push(row)
    frames.push({
      phase: 'check', activeLine: sqlAt('WHERE rating'), pythonLine: pyAt('isna()'),
      message: isNull ? `${row.title} has a NULL rating: keep it.` : `${row.title} has rating ${row.rating}: skip it.`,
      rows: snap(kept),
    })
  }

  const sorted = [...kept].sort((a, b) => a.book_id - b.book_id)
  frames.push({ phase: 'order', activeLine: sqlAt('ORDER BY'), pythonLine: pyAt('sort_values'), message: 'Sort by book_id.', rows: snap(sorted) })

  const result = sorted.map(({ book_id, title }) => ({ book_id, title }))
  frames.push({ phase: 'output', activeLine: sqlAt('SELECT book_id'), pythonLine: pyAt('return picked'), message: `Result has ${result.length} row${result.length === 1 ? '' : 's'}.`, rows: snap(result), result: true })
  return { input: { books }, result, frames }
}
