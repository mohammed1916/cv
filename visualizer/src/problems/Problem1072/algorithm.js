export function parseInput(text) {
  const matrix = JSON.parse(text)
  if (!Array.isArray(matrix) || matrix.length < 1 || matrix.length > 6) throw new Error('Use a JSON array of 1 to 6 rows.')
  const cols = Array.isArray(matrix[0]) ? matrix[0].length : 0
  if (cols < 1 || cols > 6) throw new Error('Each row has 1 to 6 entries.')
  if (matrix.some(row => !Array.isArray(row) || row.length !== cols)) throw new Error('Every row must have the same length.')
  if (matrix.some(row => row.some(v => v !== 0 && v !== 1))) throw new Error('Entries are 0 or 1.')
  return matrix
}

const same = (a, b) => a.every((v, i) => v === b[i])
const complement = row => row.map(v => 1 - v)

export function buildTrace(matrix) {
  const frames = [{ phase: 'start', activeLine: L('count how many rows'), row: -1, matched: [], best: 0, bestRows: [], message: 'Look at each row as a pattern. Flipping columns can make a row and its complement equal.' }]
  let best = 0
  let bestRows = []
  matrix.forEach((row, r) => {
    const flipped = complement(row)
    const matched = []
    matrix.forEach((other, i) => {
      if (same(other, row) || same(other, flipped)) matched.push(i)
    })
    if (matched.length > best) {
      best = matched.length
      bestRows = matched
    }
    frames.push({ phase: 'row', activeLine: L('same = rows'), row: r, matched, best, bestRows, message: `Row ${r} matches ${matched.length} row${matched.length === 1 ? '' : 's'} once the right columns are flipped (rows ${matched.join(', ')}).` })
  })
  frames.push({ phase: 'done', activeLine: L('return best'), row: -1, matched: [], best, bestRows, message: `Most rows that can be equal together: ${best}.` })
  return { input: matrix, result: best, frames }
}

export const code = `most rows that become all equal after flipping columns
  count how many rows have each exact pattern
  best = 0
  for each row r
    same = rows equal to row r, plus rows equal to the complement of row r
    best = larger of best and same
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import Counter

def max_equal_rows_after_flips(matrix):
    patterns = Counter(tuple(row) for row in matrix)
    best = 0
    for row in matrix:
        complement = tuple(1 - x for x in row)
        same = patterns[tuple(row)] + patterns[complement]
        best = max(best, same)
    return best
`
