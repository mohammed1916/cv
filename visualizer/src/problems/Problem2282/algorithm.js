const MAX_SIDE = 8
const MAX_HEIGHT = 99

export function parseInput(text) {
  const heights = JSON.parse(text)
  if (!Array.isArray(heights) || heights.length < 1 || heights.length > MAX_SIDE) throw new Error(`Use a list of 1 to ${MAX_SIDE} rows.`)
  const cols = Array.isArray(heights[0]) ? heights[0].length : 0
  if (cols < 1 || cols > MAX_SIDE) throw new Error(`Each row needs 1 to ${MAX_SIDE} heights.`)
  for (const row of heights) {
    if (!Array.isArray(row) || row.length !== cols) throw new Error('Every row needs the same number of heights.')
    for (const h of row) {
      if (!Number.isInteger(h) || h < 1 || h > MAX_HEIGHT) throw new Error(`Heights are whole numbers from 1 to ${MAX_HEIGHT}.`)
    }
  }
  return heights
}

export const code = `count how many people each person can see to the right and below
set every answer cell to zero
for each row r
  right = stack pass over row r, from its last column back to its first
  add right[c] to answer[r][c] for every column c
for each column c
  down = stack pass over column c, from its last row back to its first
  add down[r] to answer[r][c] for every row r
return answer
stack pass over one line of heights, far end first
  for each position j from the far end back to the start
    h = height at j
    count = 0
    while stack top is lower than h: pop it and count it as visible
    if stack is not empty: count the top as visible
    counts[j] = count
    while stack top is at most h: pop it, since equal heights hide the older one
    push (j, h)
  return counts`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def count_visible(values):
    n = len(values)
    counts = [0] * n
    stack = []
    for j in range(n - 1, -1, -1):
        h = values[j]
        count = 0
        while stack and stack[-1][1] < h:
            stack.pop()
            count += 1
        if stack:
            count += 1
        counts[j] = count
        while stack and stack[-1][1] <= h:
            stack.pop()
        stack.append((j, h))
    return counts


def seen_people(heights):
    rows = len(heights)
    cols = len(heights[0])
    answer = [[0] * cols for _ in range(rows)]
    for r in range(rows):
        right = count_visible(heights[r])
        for c in range(cols):
            answer[r][c] += right[c]
    for c in range(cols):
        down = count_visible([heights[r][c] for r in range(rows)])
        for r in range(rows):
            answer[r][c] += down[r]
    return answer
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const PY_LINES = python.split('\n')
const PL = text => {
  const index = PY_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export function buildTrace(heights) {
  const rows = heights.length
  const cols = heights[0].length
  const answer = Array.from({ length: rows }, () => Array(cols).fill(0))
  const frames = []
  const snap = extra => ({ rows, cols, heights, answer: answer.map(row => row.slice()), ...extra })
  const copyStack = stack => stack.map(e => [e.r, e.c, e.h])
  const copyPairs = list => list.map(item => item.slice())

  frames.push(snap({
    phase: 'start', activeLine: L('set every answer cell to zero'), pythonLine: PL('answer = [[0]'),
    mode: 'setup', line: null, cell: null, stack: [], visible: [], counted: [],
    message: `Start a ${rows} by ${cols} answer grid with every count at zero.`,
  }))

  for (const mode of ['row', 'column']) {
    const lineTotal = mode === 'row' ? rows : cols
    for (let line = 0; line < lineTotal; line++) {
      const at = k => (mode === 'row' ? [line, k] : [k, line])
      const length = mode === 'row' ? cols : rows
      const label = mode === 'row' ? `row ${line}, looking right` : `column ${line}, looking down`
      const stack = []
      const counted = []
      frames.push(snap({
        phase: 'line', activeLine: L(mode === 'row' ? 'right = stack pass' : 'down = stack pass'),
        pythonLine: PL(mode === 'row' ? 'right = count_visible' : 'down = count_visible'),
        mode, line, cell: null, stack: [], visible: [], counted: [],
        message: `Begin the ${label} with an empty stack.`,
      }))
      for (let k = length - 1; k >= 0; k--) {
        const [r, c] = at(k)
        const h = heights[r][c]
        frames.push(snap({
          phase: 'scan', activeLine: L('h = height at j'), pythonLine: PL('h = values[j]'),
          mode, line, cell: [r, c], stack: copyStack(stack), visible: [], counted: copyPairs(counted),
          message: `Position (${r}, ${c}) has height ${h}. Its stack holds ${stack.length} earlier entr${stack.length === 1 ? 'y' : 'ies'}.`,
        }))
        let count = 0
        const visible = []
        while (stack.length && stack[stack.length - 1].h < h) {
          const top = stack.pop()
          count += 1
          visible.push([top.r, top.c])
          frames.push(snap({
            phase: 'pop', activeLine: L('while stack top is lower'), pythonLine: PL('while stack and stack[-1][1] < h'),
            mode, line, cell: [r, c], stack: copyStack(stack), visible: copyPairs(visible), counted: copyPairs(counted),
            message: `Height ${top.h} at (${top.r}, ${top.c}) is shorter than ${h}, so it is visible. Count is ${count}.`,
          }))
        }
        if (stack.length) {
          const top = stack[stack.length - 1]
          count += 1
          visible.push([top.r, top.c])
        }
        counted.push([r, c, count])
        frames.push(snap({
          phase: 'count', activeLine: L('counts[j] = count'), pythonLine: PL('counts[j] = count'),
          mode, line, cell: [r, c], stack: copyStack(stack), visible: copyPairs(visible), counted: copyPairs(counted),
          message: `(${r}, ${c}) sees ${count} in this direction. The first taller or equal person still on the stack ends the view.`,
        }))
        while (stack.length && stack[stack.length - 1].h <= h) stack.pop()
        stack.push({ r, c, h })
        frames.push(snap({
          phase: 'push', activeLine: L('push (j, h)'), pythonLine: PL('stack.append((j, h))'),
          mode, line, cell: [r, c], stack: copyStack(stack), visible: [], counted: copyPairs(counted),
          message: `Push (${r}, ${c}) with height ${h}. Equal or shorter entries underneath are no longer needed.`,
        }))
      }
      for (const [r, c, count] of counted) answer[r][c] += count
      frames.push(snap({
        phase: 'add', activeLine: L(mode === 'row' ? 'add right[c]' : 'add down[r]'),
        pythonLine: PL(mode === 'row' ? 'answer[r][c] += right[c]' : 'answer[r][c] += down[r]'),
        mode, line, cell: null, stack: [], visible: [], counted: copyPairs(counted),
        message: `Add the ${label} counts to the answer grid.`,
      }))
    }
  }

  frames.push(snap({
    phase: 'done', activeLine: L('return answer'), pythonLine: PL('return answer'),
    mode: 'done', line: null, cell: null, stack: [], visible: [], counted: [],
    message: 'Every cell now holds its visible count to the right plus its visible count below.',
  }))
  return { input: heights, rows, cols, result: answer, answer, frames }
}
