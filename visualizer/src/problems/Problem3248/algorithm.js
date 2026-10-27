const DELTA = { UP: [-1, 0], DOWN: [1, 0], LEFT: [0, -1], RIGHT: [0, 1] }

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with n and commands.')
  const { n, commands } = data
  if (!Number.isInteger(n) || n < 2 || n > 8) throw new Error('n is an integer from 2 to 8.')
  if (!Array.isArray(commands) || commands.length < 1 || commands.length > 40) throw new Error('commands holds 1 to 40 moves.')
  let row = 0
  let col = 0
  for (const cmd of commands) {
    if (!(cmd in DELTA)) throw new Error('Each command is UP, DOWN, LEFT or RIGHT.')
    row += DELTA[cmd][0]
    col += DELTA[cmd][1]
    if (row < 0 || col < 0 || row >= n || col >= n) throw new Error('The snake must stay inside the grid.')
  }
  return { n, commands }
}

export function buildTrace(input) {
  const { n, commands } = input
  let row = 0
  let col = 0
  const frames = [{ phase: 'start', activeLine: L('set row to 0'), row, col, index: -1, message: 'The snake starts in cell 0.' }]
  commands.forEach((cmd, i) => {
    if (cmd === 'UP') row -= 1
    else if (cmd === 'DOWN') row += 1
    else if (cmd === 'LEFT') col -= 1
    else col += 1
    frames.push({ phase: 'move', activeLine: L(`if command is ${cmd}`), row, col, index: i, message: `Command ${i + 1} ${cmd} moves the snake to row ${row}, column ${col}.` })
  })
  const result = row * n + col
  frames.push({ phase: 'done', activeLine: L('return row times n'), row, col, index: -1, message: `Final cell index: ${row} times ${n} plus ${col} is ${result}.` })
  return { input, result, frames }
}

export const code = `find the final cell index of the snake
  set row to 0 and column to 0
  for each command in order
    if command is UP then subtract 1 from row
    if command is DOWN then add 1 to row
    if command is LEFT then subtract 1 from column
    if command is RIGHT then add 1 to column
  return row times n plus column`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def final_cell(n, commands):
    row = 0
    col = 0
    for cmd in commands:
        if cmd == "UP":
            row -= 1
        elif cmd == "DOWN":
            row += 1
        elif cmd == "LEFT":
            col -= 1
        else:
            col += 1
    return row * n + col
`
