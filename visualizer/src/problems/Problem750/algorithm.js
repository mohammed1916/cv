export function parseInput(text) {
  const grid = JSON.parse(text)
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 10 || grid.some(row => !Array.isArray(row) || row.length !== grid[0].length || row.length < 1 || row.length > 10 || row.some(v => v !== 0 && v !== 1))) {
    throw new Error('Enter a rectangular grid of up to 10 by 10 values, each 0 or 1.')
  }
  return grid
}

const JS_LINES = [
  'function countCornerRectangles(grid) {',
  '  let total = 0',
  '  for (let r1 = 0; r1 < grid.length; r1++) {',
  '    for (let r2 = r1 + 1; r2 < grid.length; r2++) {',
  '      let shared = 0 // columns where both rows have a 1',
  '      for (let c = 0; c < grid[0].length; c++) {',
  '        if (grid[r1][c] === 1 && grid[r2][c] === 1) shared++',
  '      }',
  '      total += shared * (shared - 1) / 2 // any two shared columns close a rectangle',
  '    }',
  '  }',
  '  return total',
  '}',
]
const PY_LINES = [
  'def count_corner_rectangles(grid):',
  '    total = 0',
  '    for r1 in range(len(grid)):',
  '        for r2 in range(r1 + 1, len(grid)):',
  '            shared = 0',
  '            for c in range(len(grid[0])):',
  '                if grid[r1][c] == 1 and grid[r2][c] == 1:',
  '                    shared += 1',
  '            total += shared * (shared - 1) // 2',
  '    return total',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// Fix a pair of rows. Each column where both rows hold a 1 is a possible side; any two such columns form a rectangle.
export function buildTrace(grid) {
  let total = 0
  const frames = [{ phase: 'start', rows: null, shared: [], total, activeLine: L('let total = 0'), pythonLine: P('total = 0'), message: 'Fix two rows at a time. Their shared columns are the candidate sides.' }]
  for (let r1 = 0; r1 < grid.length; r1++) {
    for (let r2 = r1 + 1; r2 < grid.length; r2++) {
      const shared = []
      for (let c = 0; c < grid[0].length; c++) if (grid[r1][c] === 1 && grid[r2][c] === 1) shared.push(c)
      const added = shared.length * (shared.length - 1) / 2
      total += added
      frames.push({ phase: 'pair', rows: [r1, r2], shared, total, added, activeLine: L('let shared = 0'), pythonLine: P('shared = 0'),
        message: `Rows ${r1} and ${r2} share ${shared.length} column${shared.length === 1 ? '' : 's'} with a 1 (${shared.join(', ') || 'none'}), giving ${added} rectangle${added === 1 ? '' : 's'}.` })
    }
  }
  frames.push({ phase: 'done', rows: null, shared: [], total, result: total, activeLine: L('return total'), pythonLine: P('return total'), message: `${total} corner rectangle${total === 1 ? '' : 's'} in total.` })
  return { input: grid, result: total, frames }
}
