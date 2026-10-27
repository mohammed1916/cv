const MAX_ROWS = 6
const MAX_COLS = 6

export function parseInput(text) {
  const data = JSON.parse(text)
  const matrix = data?.matrix
  const numSelect = data?.num_select
  if (!Array.isArray(matrix) || matrix.length < 1 || matrix.length > MAX_ROWS) throw new Error(`matrix must have 1 to ${MAX_ROWS} rows.`)
  const n = Array.isArray(matrix[0]) ? matrix[0].length : 0
  if (n < 1 || n > MAX_COLS) throw new Error(`Each row must have 1 to ${MAX_COLS} columns.`)
  for (const row of matrix) {
    if (!Array.isArray(row) || row.length !== n) throw new Error('Every row must have the same number of columns.')
    if (row.some(v => v !== 0 && v !== 1)) throw new Error('Matrix entries are 0 or 1.')
  }
  if (!Number.isInteger(numSelect) || numSelect < 1 || numSelect > n) throw new Error(`num_select must be from 1 to ${n}.`)
  return { matrix, num_select: numSelect }
}

export const code = `max covered rows(matrix, num_select):
  set best to 0
  for each set of num_select columns, written as a bitmask:
    set covered to 0
    for each row of matrix:
      if every column with a 1 in the row is chosen, add one to covered
    set best to the larger of best and covered
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

const popcount = mask => { let count = 0; for (let x = mask; x; x &= x - 1) count++; return count }

export function buildTrace({ matrix, num_select }) {
  const n = matrix[0].length
  const rowMasks = matrix.map(row => row.reduce((mask, v, c) => mask | (v ? 1 << c : 0), 0))
  let best = 0
  let bestMask = 0
  const frames = [{ phase: 'start', activeLine: L('set best to 0'), mask: 0, covered: 0, best: 0, message: `Choose ${num_select} of ${n} columns; try every choice.` }]
  for (let mask = 0; mask < 1 << n; mask++) {
    if (popcount(mask) !== num_select) continue
    let covered = 0
    for (const rowMask of rowMasks) if ((rowMask & ~mask) === 0) covered++
    if (covered > best) { best = covered; bestMask = mask }
    frames.push({ phase: 'choice', activeLine: L('if every column with a 1'), mask, covered, best, message: `Columns ${[...Array(n).keys()].filter(c => (mask >> c) & 1).map(c => c + 1).join(', ')} cover ${covered} row(s); best ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), mask: bestMask, covered: best, best, message: `Maximum covered rows: ${best}.` })
  return { input: { matrix, num_select }, matrix, num_select, result: best, frames }
}

export const python = `def max_covered_rows(matrix, num_select):
    m, n = len(matrix), len(matrix[0])
    best = 0
    for mask in range(1 << n):
        if bin(mask).count('1') != num_select:
            continue
        covered = 0
        for row in matrix:
            needed = 0
            for c in range(n):
                if row[c] == 1:
                    needed |= 1 << c
            if needed & ~mask == 0:
                covered += 1
        best = max(best, covered)
    return best
`
