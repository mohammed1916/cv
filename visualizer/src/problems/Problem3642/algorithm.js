// Knowledge-derived draft: the rule is the author's own reading of the table task, not copied from an official statement.
// Rule: a rating of 4 or 5 is high, 1 or 2 is low, 3 is middle. A book is polarized when it has at least min_reviews
// reviews, no middle ratings, and at least one high and one low rating.
const numbered = list => list.map((text, index) => ({ line: index + 1, text }))
const COLS = ['book_id', 'title', 'high', 'low']
const COUNT_COLS = ['book_id', 'total', 'high', 'low', 'middle']

export const code = numbered([
  'WITH counted AS (',
  '  SELECT r.book_id,',
  '    COUNT(*) AS total,',
  '    SUM(CASE WHEN r.rating >= 4 THEN 1 ELSE 0 END) AS high,',
  '    SUM(CASE WHEN r.rating <= 2 THEN 1 ELSE 0 END) AS low,',
  '    SUM(CASE WHEN r.rating = 3 THEN 1 ELSE 0 END) AS middle',
  '  FROM reviews r GROUP BY r.book_id',
  ')',
  'SELECT b.book_id, b.title, c.high, c.low',
  'FROM counted c JOIN books b USING (book_id)',
  'WHERE c.total >= :min_reviews AND c.middle = 0 AND c.high > 0 AND c.low > 0',
  'ORDER BY b.title',
])

export const python = `import pandas as pd
def polarized_books(books, reviews, min_reviews):
    r = reviews.assign(high=reviews.rating >= 4, low=reviews.rating <= 2, middle=reviews.rating == 3)
    g = r.groupby("book_id").agg(total=("rating", "size"), high=("high", "sum"), low=("low", "sum"), middle=("middle", "sum"))
    g = g[(g.total >= min_reviews) & (g.middle == 0) & (g.high > 0) & (g.low > 0)]
    out = g.reset_index().merge(books, on="book_id")
    return out.sort_values("title")[["book_id", "title", "high", "low"]]
`

const pyLines = numbered(python.split('\n'))

export const SAMPLE_TEXT = '{"min_reviews":3,"books":[{"book_id":1,"title":"Atlas"},{"book_id":2,"title":"Bramble"},{"book_id":3,"title":"Cinder"},{"book_id":4,"title":"Dune"},{"book_id":5,"title":"Echo"}],"reviews":[{"book_id":1,"rating":5},{"book_id":1,"rating":5},{"book_id":1,"rating":1},{"book_id":1,"rating":4},{"book_id":2,"rating":5},{"book_id":2,"rating":3},{"book_id":2,"rating":1},{"book_id":2,"rating":5},{"book_id":3,"rating":5},{"book_id":3,"rating":5},{"book_id":4,"rating":2},{"book_id":4,"rating":4},{"book_id":4,"rating":1},{"book_id":5,"rating":5},{"book_id":5,"rating":5},{"book_id":5,"rating":5}]}'

function lineOf(list, fragment, label) {
  const hit = list.find(row => row.text.includes(fragment))
  if (!hit) throw new Error(`${label} line missing: ${fragment}`)
  return hit.line
}

function frame(phase, sql, py, message, columns, rows) {
  return { phase, activeLine: lineOf(code, sql, 'SQL'), pythonLine: lineOf(pyLines, py, 'Python'), message, columns, rows: rows.map(row => ({ ...row })) }
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.books) || !Array.isArray(input.reviews) || !Number.isInteger(input.min_reviews) || input.min_reviews < 1) {
    throw new Error('Use books, reviews and a whole-number min_reviews of at least 1.')
  }
  for (const r of input.reviews) {
    if (!Number.isInteger(r.rating) || r.rating < 1 || r.rating > 5) throw new Error('Each rating is a whole number from 1 to 5.')
  }
  return input
}

export function buildTrace(input) {
  const { books, reviews, min_reviews: minReviews } = input
  const title = new Map(books.map(b => [b.book_id, b.title]))
  const frames = [frame('load', 'WITH counted AS (', 'def polarized_books', `Load ${reviews.length} reviews.`, ['book_id', 'rating'], reviews)]
  const counts = []
  const found = []
  for (const b of books) {
    const mine = reviews.filter(r => r.book_id === b.book_id)
    const row = {
      book_id: b.book_id,
      total: mine.length,
      high: mine.filter(r => r.rating >= 4).length,
      low: mine.filter(r => r.rating <= 2).length,
      middle: mine.filter(r => r.rating === 3).length,
    }
    counts.push(row)
    frames.push(frame('count', 'COUNT(*) AS total', 'agg(total=', `${b.title} has ${row.total} review(s).`, COUNT_COLS, counts))
    if (row.total < minReviews) {
      frames.push(frame('reject', 'WHERE c.total >= :min_reviews', 'g = g[(g.total', `${b.title} has too few reviews.`, COUNT_COLS, counts))
    } else if (row.middle > 0) {
      frames.push(frame('reject', 'AND c.middle = 0', 'g = g[(g.total', `${b.title} has a middle rating, so it is not polarized.`, COUNT_COLS, counts))
    } else if (row.high > 0 && row.low > 0) {
      found.push({ book_id: b.book_id, title: title.get(b.book_id), high: row.high, low: row.low })
      frames.push(frame('keep', 'AND c.high > 0 AND c.low > 0', 'g.low > 0', `${b.title} is polarized.`, COLS, found))
    } else {
      frames.push(frame('reject', 'AND c.high > 0 AND c.low > 0', 'g.low > 0', `${b.title} lacks one side of the scale.`, COUNT_COLS, counts))
    }
  }
  const rows = [...found].sort((a, b) => a.title.localeCompare(b.title))
  frames.push(frame('order', 'ORDER BY b.title', 'sort_values("title")', 'Sort by title.', COLS, rows))
  frames.push(frame('done', 'SELECT b.book_id, b.title', 'return out.sort_values("title")', `Result has ${rows.length} row(s).`, COLS, rows))
  return { input: { books, reviews, min_reviews: minReviews }, result: rows, frames }
}
