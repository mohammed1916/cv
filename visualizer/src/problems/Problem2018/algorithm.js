export const phases = [
  { id: 'start', label: 'Open runs', description: 'Each row and column splits at # cells into open runs; a word needs one run of its exact length.' },
  { id: 'run', label: 'Test a run', description: 'Compare the word, and its reverse, with the run cell by cell; a cell must be empty or already match.' },
  { id: 'done', label: 'Result', description: 'Return true when some run fits the word exactly.' },
]

export const code = `function canPlaceWord(board, word) {
  const rows = board.length
  const cols = board[0].length
  const reversed = [...word].reverse().join('')
  const fits = (run, text) => run.length === text.length
    && run.every(([r, c], k) => board[r][c] === ' ' || board[r][c] === text[k])
  const runsOf = cells => {
    const runs = []
    let run = []
    for (const [r, c] of cells) {
      if (board[r][c] === '#') {
        if (run.length) runs.push(run)
        run = []
      } else {
        run.push([r, c])
      }
    }
    if (run.length) runs.push(run)
    return runs
  }
  const lines = []
  for (let r = 0; r < rows; r++) lines.push(...runsOf(Array.from({ length: cols }, (_, c) => [r, c])))
  for (let c = 0; c < cols; c++) lines.push(...runsOf(Array.from({ length: rows }, (_, r) => [r, c])))
  return lines.some(run => fits(run, word) || fits(run, reversed))
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def can_place_word(board, word):
    rows = len(board)
    cols = len(board[0])
    reversed_word = word[::-1]

    def fits(run, text):
        return len(run) == len(text) and all(board[r][c] in (' ', text[k]) for k, (r, c) in enumerate(run))

    def runs_of(cells):
        runs = []
        run = []
        for r, c in cells:
            if board[r][c] == '#':
                if run:
                    runs.append(run)
                run = []
            else:
                run.append((r, c))
        if run:
            runs.append(run)
        return runs

    lines = []
    for r in range(rows):
        lines.extend(runs_of([(r, c) for c in range(cols)]))
    for c in range(cols):
        lines.extend(runs_of([(r, c) for r in range(rows)]))
    return any(fits(run, word) or fits(run, reversed_word) for run in lines)
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let obj
  try { obj = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"board":["#  ","   "],"word":"ab"}.') }
  const { board, word } = obj || {}
  if (!Array.isArray(board) || board.length < 1 || board.length > 8) throw new Error('board must have 1 to 8 rows.')
  const width = board[0].length
  if (width < 1 || width > 8 || !board.every(row => typeof row === 'string' && row.length === width && /^[a-z #]+$/.test(row))) {
    throw new Error('Every row must have the same length (1 to 8), using lowercase letters, spaces for empty and # for blocked.')
  }
  if (typeof word !== 'string' || word.length < 1 || word.length > 8 || !/^[a-z]+$/.test(word)) throw new Error('word must be 1 to 8 lowercase letters.')
  return { board, word }
}

export function buildTrace({ board, word }) {
  const frames = []
  const rows = board.length, cols = board[0].length
  const reversed = [...word].reverse().join('')
  const fits = (run, text) => run.length === text.length && run.every(([r, c], k) => board[r][c] === ' ' || board[r][c] === text[k])
  const runsOf = cells => {
    const runs = []
    let run = []
    for (const [r, c] of cells) {
      if (board[r][c] === '#') {
        if (run.length) runs.push(run)
        run = []
      } else {
        run.push([r, c])
      }
    }
    if (run.length) runs.push(run)
    return runs
  }
  const lines = []
  for (let r = 0; r < rows; r++) lines.push(...runsOf(Array.from({ length: cols }, (_, c) => [r, c])))
  for (let c = 0; c < cols; c++) lines.push(...runsOf(Array.from({ length: rows }, (_, r) => [r, c])))
  const add = (phase, c, p, message, run, ok) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { board, word, run, ok, runCount: lines.length },
  })
  add('start', 'const lines = []', 'lines = []', `The board has ${lines.length} open run(s) of length 2 or more to test.`, null, null)
  let found = false
  for (const run of lines) {
    const ok = fits(run, word) || fits(run, reversed)
    add('run', 'return lines.some', 'return any(', ok ? `Run of length ${run.length} matches the word exactly.` : `Run of length ${run.length} does not match.`, run, ok)
    if (ok) { found = true; break }
  }
  add('done', 'return lines.some', 'return any(', found ? 'The word can be placed.' : 'No run matches the word.', null, found)
  return { input: { board, word }, result: found, frames }
}
