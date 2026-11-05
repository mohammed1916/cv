export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.grid)) throw new Error('Use an object with a grid array of rows, for example {"grid":[[1,0,2],[1,0,2]]}.')
  const rows = data.grid.length
  if (rows < 1 || rows > 4) throw new Error('grid must have 1 to 4 rows.')
  const cols = Array.isArray(data.grid[0]) ? data.grid[0].length : 0
  if (cols < 1 || cols > 4) throw new Error('grid must have 1 to 4 columns.')
  if (!data.grid.every(row => Array.isArray(row) && row.length === cols && row.every(v => Number.isInteger(v) && v >= 0 && v <= 9))) throw new Error('Every row must have the same length and hold digits 0 to 9.')
  return { grid: data.grid }
}

export function buildTrace(input) {
  const { grid } = input
  const rows = grid.length
  const cols = grid[0].length
  let previous = Array.from({ length: 10 }, () => 0)
  const history = []
  const frames = [{ pythonLine: 4, phase: 'start', activeLine: L('let previous = Array(10)'), column: -1, previous: previous.slice(), history: [], result: null, message: 'Before the first column, every colour costs 0.' }]
  for (let j = 0; j < cols; j++) {
    const next = Array.from({ length: 10 }, () => 0)
    for (let c = 0; c < 10; c++) {
      let cost = 0
      for (let i = 0; i < rows; i++) if (grid[i][j] !== c) cost += 1
      let cheapestOther = Infinity
      for (let p = 0; p < 10; p++) if (p !== c) cheapestOther = Math.min(cheapestOther, previous[p])
      next[c] = cost + cheapestOther
    }
    previous = next
    history.push(previous.slice())
    frames.push({ pythonLine: 10, phase: 'column', activeLine: L('previous = next'), column: j, previous: previous.slice(), history: history.map(row => row.slice()), result: null, message: `Column ${j} costs ${previous.join(', ')} for colours 0 to 9.` })
  }
  const result = Math.min(...previous)
  frames.push({ pythonLine: 11, phase: 'done', activeLine: L('return Math.min'), column: cols, previous: previous.slice(), history: history.map(row => row.slice()), result, message: `Fewest operations: ${result}.` })
  return { input, result, frames }
}

export const code = `function minOperations(grid) {
  const rows = grid.length
  const cols = grid[0].length
  let previous = Array(10).fill(0)
  for (let j = 0; j < cols; j++) {
    const next = Array(10).fill(0)
    for (let c = 0; c < 10; c++) {
      let cost = 0
      for (let i = 0; i < rows; i++) if (grid[i][j] !== c) cost += 1
      let cheapestOther = Infinity
      for (let p = 0; p < 10; p++) if (p !== c) cheapestOther = Math.min(cheapestOther, previous[p])
      next[c] = cost + cheapestOther
    }
    previous = next
  }
  return Math.min(...previous)
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error('No code line: ' + s); return i + 1 }

export const python = `def min_operations(grid):
    rows = len(grid)
    cols = len(grid[0])
    previous = [0] * 10
    for j in range(cols):
        nxt = [0] * 10
        for c in range(10):
            cost = sum(1 for i in range(rows) if grid[i][j] != c)
            nxt[c] = cost + min(previous[p] for p in range(10) if p != c)
        previous = nxt
    return min(previous)`
