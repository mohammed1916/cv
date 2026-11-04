// Own wording and sample data. The depth-first search follows the Python solution in `python`.
export const phases = [
  { id: 'start', label: 'Start', description: 'Try each cell that holds gold as the first cell of a path.' },
  { id: 'extend', label: 'Extend path', description: 'Mark the cell as used on this path and try each unused neighbour that holds gold.' },
  { id: 'backtrack', label: 'Release cell', description: 'Unmark the cell so other paths can use it, and return the best total from here.' },
  { id: 'done', label: 'Result', description: 'Return the largest total over all starting cells.' },
]

export const inputLabel = 'Grid of gold amounts as an array of rows (JSON)'
export const complexity = 'O(R·C·4^(R·C)) worst case for simple paths, since every path may be explored. The visualizer caps the grid at 5 by 5 cells.'
export const examples = [
  { label: 'Two-cell pocket', input: '[[1,0,4],[2,0,3],[0,5,0]]' },
  { label: 'Straight corridor', input: '[[2,3,4],[0,0,0]]' },
  { label: 'Bend around a corner', input: '[[1,2],[9,3]]' },
]

export function parseInput(text) {
  const grid = JSON.parse(text)
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 5) throw new Error('Enter 1 to 5 rows of gold amounts.')
  const cols = Array.isArray(grid[0]) ? grid[0].length : 0
  if (cols < 1 || cols > 5) throw new Error('Each row must hold 1 to 5 cells.')
  grid.forEach((row, r) => {
    if (!Array.isArray(row) || row.length !== cols) throw new Error(`Row ${r} must have ${cols} cells, the same as the others.`)
    row.forEach((v, c) => { if (!Number.isInteger(v) || v < 0 || v > 100) throw new Error(`Cell (${r},${c}) must be an integer from 0 to 100.`) })
  })
  return grid
}

const codeLines = [
  "function getMaximumGold(grid) {",
  "  const rows = grid.length",
  "  const cols = grid[0].length",
  "  const used = new Set()",
  "  const explore = (r, c) => {",
  "    used.add(`${r},${c}`)",
  "    let best = 0",
  "    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {",
  "      const nr = r + dr",
  "      const nc = c + dc",
  "      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] > 0 && !used.has(`${nr},${nc}`)) {",
  "        best = Math.max(best, explore(nr, nc))",
  "      }",
  "    }",
  "    used.delete(`${r},${c}`)",
  "    return grid[r][c] + best",
  "  }",
  "  let answer = 0",
  "  for (let r = 0; r < rows; r++) {",
  "    for (let c = 0; c < cols; c++) {",
  "      if (grid[r][c] > 0) answer = Math.max(answer, explore(r, c))",
  "    }",
  "  }",
  "  return answer",
  "}",
]
const codeText = codeLines.join('\n')
const pythonText = `def get_maximum_gold(grid):
    rows, cols = len(grid), len(grid[0])
    seen = set()
    def explore(r, c):
        seen.add((r, c))                             # mark the cell as used on this path
        best = 0
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] > 0 and (nr, nc) not in seen:
                best = max(best, explore(nr, nc))
        seen.remove((r, c))                          # release it for other paths
        return grid[r][c] + best
    answer = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] > 0:
                answer = max(answer, explore(r, c))
    return answer`

export const code = codeText.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = pythonText
const L = key => codeText.split('\n').findIndex(line => line.includes(key)) + 1
const P = key => pythonText.split('\n').findIndex(line => line.includes(key)) + 1

const DIRECTIONS = [[1, 0], [-1, 0], [0, 1], [0, -1]]

export function buildTrace(grid) {
  const rows = grid.length
  const cols = grid[0].length
  const used = new Set()
  const frames = []
  let answer = 0
  const key = (r, c) => `${r},${c}`
  const snap = (extra = {}) => ({ used: [...used].map(k => k.split(',').map(Number)), answer, ...extra })

  function explore(r, c) {
    used.add(key(r, c))
    let pathTotal = 0
    frames.push({
      phase: 'extend', activeLine: L('used.add('), pythonLine: P('seen.add'),
      message: `Enter (${r},${c}) with ${grid[r][c]} gold and mark it as used on this path.`,
      snapshot: snap({ cell: [r, c] }),
    })
    let best = 0
    for (const [dr, dc] of DIRECTIONS) {
      const nr = r + dr
      const nc = c + dc
      const inside = nr >= 0 && nr < rows && nc >= 0 && nc < cols
      if (inside && grid[nr][nc] > 0 && !used.has(key(nr, nc))) {
        frames.push({
          phase: 'extend', activeLine: L('best = Math.max(best, explore'), pythonLine: P('if 0 <= nr'),
          message: `Neighbour (${nr},${nc}) has gold and is unused, so the path may continue there.`,
          snapshot: snap({ cell: [r, c], next: [nr, nc] }),
        })
        best = Math.max(best, explore(nr, nc))
      }
    }
    used.delete(key(r, c))
    pathTotal = grid[r][c] + best
    frames.push({
      phase: 'backtrack', activeLine: L('used.delete('), pythonLine: P('seen.remove'),
      message: `The best path from (${r},${c}) collects ${pathTotal}. Unmark it so other paths can pass through.`,
      snapshot: snap({ cell: [r, c], value: pathTotal }),
    })
    return pathTotal
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] <= 0) continue
      frames.push({
        phase: 'start', activeLine: L('if (grid[r][c] > 0)'), pythonLine: P('for r in range(rows)'),
        message: `Start a path at (${r},${c}), which holds ${grid[r][c]} gold.`,
        snapshot: snap({ cell: [r, c] }),
      })
      answer = Math.max(answer, explore(r, c))
    }
  }
  frames.push({
    phase: 'done', activeLine: L('return answer'), pythonLine: P('return answer'),
    message: answer ? `The largest total over all starting cells is ${answer}.` : 'The grid has no gold, so the answer is 0.',
    snapshot: snap({ cell: null }),
  })
  return { input: grid, result: answer, frames }
}
