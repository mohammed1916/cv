const PYTHON_SOURCE = `def distinctNumbersOnBoard(n):
    board = {n}
    changed = True
    while changed:
        changed = False
        for x in sorted(board):
            for i in range(1, n + 1):
                if x % i == 1 and i not in board:
                    board.add(i)
                    changed = True
    return len(board)`

const PY = PYTHON_SOURCE.split('\n')
const py = (text) => {
  const index = PY.findIndex((line) => line.trim() === text)
  if (index < 0) throw new Error(`Python line not found: ${text}`)
  return index + 1
}

export const python = PYTHON_SOURCE

export const code = [
  { line: 1, text: "function distinctNumbersOnBoard(n) {" },
  { line: 2, text: "  const board = new Set([n])" },
  { line: 3, text: "  let changed = true" },
  { line: 4, text: "  while (changed) {" },
  { line: 5, text: "    changed = false" },
  { line: 6, text: "    for (const x of [...board].sort((a, b) => a - b)) {" },
  { line: 7, text: "      for (let i = 1; i <= n; i++) {" },
  { line: 8, text: "        if (x % i === 1 && !board.has(i)) {" },
  { line: 9, text: "          board.add(i); changed = true" },
  { line: 10, text: "        }" },
  { line: 11, text: "      }" },
  { line: 12, text: "    }" },
  { line: 13, text: "  }" },
  { line: 14, text: "  return board.size" },
  { line: 15, text: "}" },
]

export function parseInput(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Input must be valid JSON, for example {"n": 5}')
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Input must be a JSON object with key n')
  const { n } = data
  if (!Number.isInteger(n) || n < 1 || n > 30) throw new Error('n must be an integer from 1 to 30 (visualization cap; LeetCode allows up to 100)')
  return { n }
}

export function buildTrace(input) {
  const { n } = input
  const frames = []
  const board = new Set([n])
  let pass = 0
  let current = null
  let added = null
  let changed = true
  const snapshot = () => [...board].sort((a, b) => a - b)
  const frame = (phase, activeLine, pythonLine, message) =>
    frames.push({ phase, activeLine, pythonLine, message, n, board: snapshot(), current, added, pass })

  frame('setup', 2, py('board = {n}'), `Start with ${n} on the board.`)
  frame('setup', 3, py('changed = True'), 'Assume the board may still change.')
  while (true) {
    frame('while', 4, py('while changed:'), changed ? 'The board changed in the last pass, so scan it again.' : 'No value was added in the last pass, so the board is final.')
    if (!changed) break
    changed = false
    pass += 1
    frame('pass', 5, py('changed = False'), `Pass ${pass}: nothing added yet.`)
    const order = snapshot()
    for (const x of order) {
      current = x
      frame('scan', 6, py('for x in sorted(board):'), `Check the board value ${x}.`)
      for (let i = 1; i <= n; i++) {
        if (x % i === 1 && !board.has(i)) {
          board.add(i)
          added = i
          changed = true
          frame('add', 9, py('board.add(i)'), `${x} mod ${i} = 1, so ${i} joins the board.`)
        }
      }
    }
    current = null
    added = null
  }
  frame('done', 14, py('return len(board)'), `${board.size} distinct numbers are on the board.`)
  return { input, result: board.size, frames }
}
