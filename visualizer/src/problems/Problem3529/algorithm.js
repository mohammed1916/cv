const MAX_CELLS = 64

export const phases = [
  { id: 'read', label: 'Read', description: 'The grid and the pattern.' },
  { id: 'table', label: 'Fail table', description: 'For each pattern prefix, the longest border: how far a mismatch falls back.' },
  { id: 'across', label: 'Scan across', description: 'KMP over the grid read row by row.' },
  { id: 'down', label: 'Scan down', description: 'KMP over the grid read column by column.' },
  { id: 'mark', label: 'Mark match', description: 'A full match adds a +1 and a -1 boundary marker.' },
  { id: 'sweep', label: 'Sweep', description: 'A running sum of the markers tells which positions any match covers.' },
  { id: 'count', label: 'Count', description: 'A cell counts when both readings cover it.' },
  { id: 'done', label: 'Result', description: 'The number of doubly covered cells.' },
]

export const code = `count cells covered in both readings
  build the fail table of the pattern
  for each pattern position i
    while the current border cannot extend, fall back through fail
    if the characters agree, extend the border
    store the border length in fail[i]
  to cover a text
    for each text position i
      while j > 0 and the character differs from pattern[j], set j to fail[j-1]
      if the character equals pattern[j], increase j
      if j reached the pattern length, add +1 at the match start and -1 after its end, then fall back
    sweep a running sum over the markers; positive means covered
  cover the row-by-row reading and the column-by-column reading
  for each cell, count it when both readings cover its position
  return the count`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def count_cells(grid, pattern):
    m, n = len(grid), len(grid[0])
    k = len(pattern)
    fail = [0] * k
    j = 0
    for i in range(1, k):
        while j and pattern[i] != pattern[j]:
            j = fail[j - 1]
        if pattern[i] == pattern[j]:
            j += 1
        fail[i] = j

    def cover(text):
        marks = [0] * (len(text) + 1)
        j = 0
        for i, ch in enumerate(text):
            while j and ch != pattern[j]:
                j = fail[j - 1]
            if ch == pattern[j]:
                j += 1
            if j == k:
                marks[i - k + 1] += 1
                marks[i + 1] -= 1
                j = fail[j - 1]
        covered = []
        active = 0
        for i in range(len(text)):
            active += marks[i]
            covered.append(active > 0)
        return covered

    across = cover("".join("".join(row) for row in grid))
    down = cover("".join(grid[r][c] for c in range(n) for r in range(m)))
    count = 0
    for r in range(m):
        for c in range(n):
            if across[r * n + c] and down[c * m + r]:
                count += 1
    return count
`

const lineOf = (lines, s) => {
  const index = lines.findIndex(text => text.includes(s))
  if (index < 0) throw new Error(`Code line missing: ${s}`)
  return index + 1
}
const pythonLines = python.trim().split('\n')
const L = s => lineOf(code.map(c => c.text), s)
// The two loops share wording, so the second occurrence is reached from a unique anchor above it.
const P = (s, after = 'def count_cells') => {
  const from = lineOf(pythonLines, after)
  const index = pythonLines.findIndex((text, i) => i >= from - 1 && text.includes(s))
  if (index < 0) throw new Error(`Python line missing: ${s}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with grid and pattern.')
  const { grid, pattern } = input
  if (!Array.isArray(grid) || grid.length < 1) throw new Error('grid needs at least one row.')
  const width = Array.isArray(grid[0]) ? grid[0].length : 0
  if (width < 1) throw new Error('Each grid row is a non-empty array of letters.')
  for (const row of grid) {
    if (!Array.isArray(row) || row.length !== width) throw new Error('All grid rows have the same length.')
    for (const ch of row) if (typeof ch !== 'string' || !/^[a-z]$/.test(ch)) throw new Error('Each cell holds one lowercase letter.')
  }
  const cells = grid.length * width
  if (cells > MAX_CELLS) throw new Error(`This page draws up to ${MAX_CELLS} cells.`)
  if (typeof pattern !== 'string' || !/^[a-z]+$/.test(pattern)) throw new Error('pattern is lowercase letters.')
  if (pattern.length > cells) throw new Error('pattern cannot be longer than the grid has cells.')
  return { grid, pattern }
}

export function buildTrace({ grid, pattern }) {
  const m = grid.length, n = grid[0].length, k = pattern.length
  const frames = []
  const fail = new Array(k).fill(0)
  const filled = [0]
  const across = grid.map(row => row.join('')).join('')
  let down = ''
  for (let c = 0; c < n; c++) for (let r = 0; r < m; r++) down += grid[r][c]
  const covered = { across: new Array(m * n).fill(false), down: new Array(m * n).fill(false) }
  const hits = { across: 0, down: 0 }
  const push = fields => frames.push({
    pass: null, text: null, i: -1, j: 0, fail: [...fail], failKnown: filled.length, marks: null, active: 0, sweepAt: -1, tableI: -1, tableJ: 0, compare: null,
    cell: null, count: 0,
    coveredAcross: [...covered.across], coveredDown: [...covered.down], hits: { ...hits }, ...fields,
  })

  push({ phase: 'read', activeLine: L('count cells covered'), pythonLine: P('m, n = len(grid)'), message: `A ${m} by ${n} grid and a pattern of ${k} letter${k === 1 ? '' : 's'}.` })

  let j = 0
  for (let i = 1; i < k; i++) {
    while (j > 0 && pattern[i] !== pattern[j]) {
      const was = j
      j = fail[j - 1]
      push({ phase: 'table', activeLine: L('while the current border'), pythonLine: P('j = fail[j - 1]'), tableI: i, tableJ: j, compare: 'mismatch', message: `pattern[${i}] = ${pattern[i]} cannot extend a border of ${was}; fall back to ${j}.` })
    }
    const agree = pattern[i] === pattern[j]
    if (agree) j++
    fail[i] = j
    filled.push(j)
    push({ phase: 'table', activeLine: L('store the border'), pythonLine: P('fail[i] = j'), tableI: i, tableJ: j, compare: agree ? 'match' : 'mismatch', failKnown: filled.length, message: agree ? `pattern[${i}] = ${pattern[i]} extends the border, so fail[${i}] = ${j}.` : `No border ends at position ${i}, so fail[${i}] = 0.` })
  }
  if (k === 1) push({ phase: 'table', activeLine: L('build the fail table'), pythonLine: P('fail = [0] * k'), message: 'A one-letter pattern has only fail[0] = 0.' })

  const scan = (pass, text, anchor, callLine) => {
    const marks = new Array(text.length + 1).fill(0)
    let matched = 0
    push({ phase: pass, pass, text, marks: [...marks], activeLine: L('cover the row-by-row'), pythonLine: callLine, message: pass === 'across' ? `Read the grid row by row, wrapping each row into the next: ${text}.` : `Read the grid column by column, wrapping each column into the next: ${text}.` })
    for (let i = 0; i < text.length; i++) {
      const ch = text[i]
      while (matched > 0 && ch !== pattern[matched]) {
        const was = matched
        matched = fail[matched - 1]
        push({ phase: pass, pass, text, i, j: matched, marks: [...marks], compare: 'mismatch', activeLine: L('while j > 0'), pythonLine: P('j = fail[j - 1]', anchor), message: `${ch} breaks the ${was} matched letters. The longest usable border is ${matched}, so the pattern slides without rereading text.` })
      }
      if (ch === pattern[matched]) {
        matched++
        push({ phase: pass, pass, text, i, j: matched, marks: [...marks], compare: 'match', activeLine: L('if the character equals'), pythonLine: P('j += 1', anchor), message: `${ch} matches pattern[${matched - 1}]; ${matched} of ${k} letters matched.` })
      } else {
        push({ phase: pass, pass, text, i, j: 0, marks: [...marks], compare: 'mismatch', activeLine: L('if the character equals'), pythonLine: P('if ch == pattern[j]', anchor), message: `${ch} does not start the pattern; move on.` })
      }
      if (matched === k) {
        const start = i - k + 1
        marks[start] += 1
        marks[i + 1] -= 1
        hits[pass]++
        push({ phase: 'mark', pass, text, i, j: matched, marks: [...marks], compare: 'hit', activeLine: L('if j reached'), pythonLine: P('marks[i + 1] -= 1', anchor), message: `Full match at positions ${start} to ${i}: +1 at ${start}, -1 at ${i + 1}.` })
        matched = fail[matched - 1]
        push({ phase: 'mark', pass, text, i, j: matched, marks: [...marks], compare: null, activeLine: L('if j reached'), pythonLine: P('j = fail[j - 1]', 'marks[i + 1] -= 1'), message: `Keep the border of ${matched} so overlapping matches are still found.` })
      }
    }
    let active = 0
    for (let i = 0; i < text.length; i++) {
      active += marks[i]
      covered[pass][i] = active > 0
      push({ phase: 'sweep', pass, text, i: -1, sweepAt: i, active, marks: [...marks], activeLine: L('sweep a running sum'), pythonLine: P('covered.append'), message: `Position ${i}: running sum ${active}, so it is ${active > 0 ? 'covered' : 'not covered'}.` })
    }
  }
  scan('across', across, 'def cover', P('across = cover'))
  scan('down', down, 'def cover', P('down = cover'))

  let count = 0
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      const a = covered.across[r * n + c], d = covered.down[c * m + r]
      if (a && d) count++
      push({ phase: 'count', activeLine: L('for each cell, count'), pythonLine: a && d ? P('count += 1') : P('if across[r * n + c]'), cell: { r, c }, count, message: `Cell (${r}, ${c}) is position ${r * n + c} across and ${c * m + r} down: ${a ? 'covered' : 'not covered'} across, ${d ? 'covered' : 'not covered'} down${a && d ? ', so count it' : ''}. Count ${count}.` })
    }
  }
  push({ phase: 'done', activeLine: L('return the count'), pythonLine: P('return count'), count, message: `${count} cell${count === 1 ? ' is' : 's are'} covered in both readings.` })
  return { input: { grid, pattern }, result: count, frames }
}
