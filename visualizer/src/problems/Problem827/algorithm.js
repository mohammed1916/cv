export function parseInput(text) {
  const grid = JSON.parse(text)
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 8 || grid.some(row => !Array.isArray(row) || row.length !== grid.length || row.some(v => v !== 0 && v !== 1))) {
    throw new Error('Enter a square grid of up to 8 by 8 values, each 0 or 1.')
  }
  return grid
}

const JS_LINES = [
  'function largestIsland(grid) {',
  '  const n = grid.length',
  '  const id = grid.map(row => row.map(() => -1)) // island label for each land cell',
  '  const size = [] // size[label] = number of cells in that island',
  '  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {',
  "    if (grid[r][c] === 1 && id[r][c] === -1) { // flood-fill one island from (r, c)",
  '      const label = size.length, stack = [[r, c]]',
  '      id[r][c] = label',
  '      let count = 0',
  '      while (stack.length) {',
  '        const [y, x] = stack.pop()',
  '        count++',
  '        for (const [dy, dx] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {',
  '          const ny = y + dy, nx = x + dx',
  '          if (ny >= 0 && nx >= 0 && ny < n && nx < n && grid[ny][nx] === 1 && id[ny][nx] === -1) { id[ny][nx] = label; stack.push([ny, nx]) }',
  '        }',
  '      }',
  '      size.push(count) // size[label] = cells in this island',
  '    }',
  '  }',
  '  let best = size.length ? Math.max(...size) : 0 // no flip: the largest existing island',
  '  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {',
  '    if (grid[r][c] === 1) continue',
  '    const seen = new Set()', 
  '    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {',
  '      const nr = r + dr, nc = c + dc',
  '      if (nr >= 0 && nc >= 0 && nr < n && nc < n && grid[nr][nc] === 1) seen.add(id[nr][nc]) // neighbouring islands',
  '    }',
  '    let total = 1 // the flipped cell itself',
  '    for (const label of seen) total += size[label]',
  '    best = Math.max(best, total)',
  '  }',
  '  return best // return the largest island after at most one flip',
  '}',
]
const PY_LINES = [
  'def largest_island(grid):',
  '    n = len(grid)',
  '    label = [[-1] * n for _ in range(n)]',
  '    size = []',
  '    for r in range(n):',
  '        for c in range(n):',
  '            if grid[r][c] == 1 and label[r][c] == -1:',
  '                size.append(flood(grid, label, r, c, len(size)))',
  '    best = max(size) if size else 0',
  '    for r in range(n):',
  '        for c in range(n):',
  '            if grid[r][c] == 1:',
  '                continue',
  '            seen = set()',
  '            for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):',
  '                nr, nc = r + dr, c + dc',
  '                if 0 <= nr < n and 0 <= nc < n and grid[nr][nc] == 1:',
  '                    seen.add(label[nr][nc])',
  '            best = max(best, 1 + sum(size[x] for x in seen))',
  '    return best',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// Label every island with its size. A 0 cell that is flipped joins the distinct islands beside it: 1 + their sizes.
export function buildTrace(grid) {
  const n = grid.length
  const id = grid.map(row => row.map(() => -1))
  const size = []
  const frames = [{ phase: 'label', cell: null, id: id.map(r => [...r]), size: [], best: 0, activeLine: L('const id = grid.map'), pythonLine: P('label = [[-1]'), message: 'First, label each island and measure its size.' }]
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (grid[r][c] === 1 && id[r][c] === -1) {
      const label = size.length
      const stack = [[r, c]]
      id[r][c] = label
      let count = 0
      while (stack.length) {
        const [y, x] = stack.pop()
        count++
        for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          const ny = y + dr, nx = x + dc
          if (ny >= 0 && nx >= 0 && ny < n && nx < n && grid[ny][nx] === 1 && id[ny][nx] === -1) { id[ny][nx] = label; stack.push([ny, nx]) }
        }
      }
      size.push(count)
      frames.push({ phase: 'label', cell: [r, c], id: id.map(row => [...row]), size: [...size], best: 0, activeLine: L('size.push(count)'), pythonLine: P('size.append(flood'), message: `Island ${label} starts at (${r}, ${c}) and has ${count} cell${count === 1 ? '' : 's'}.` })
    }
  }
  let best = size.length ? Math.max(...size) : 0
  frames.push({ phase: 'flip', cell: null, id: id.map(r => [...r]), size: [...size], best, activeLine: L('let best = size.length'), pythonLine: P('best = max(size)'), message: `Without a flip the largest island has ${best} cell${best === 1 ? '' : 's'}.` })
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (grid[r][c] === 1) continue
    const seen = new Set()
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nr = r + dr, nc = c + dc
      if (nr >= 0 && nc >= 0 && nr < n && nc < n && grid[nr][nc] === 1) seen.add(id[nr][nc])
    }
    let total = 1
    for (const label of seen) total += size[label]
    best = Math.max(best, total)
    frames.push({ phase: 'flip', cell: [r, c], id: id.map(row => [...row]), size: [...size], neighbours: [...seen], best, activeLine: L('for (const label of seen)'), pythonLine: P('best = max(best, 1 +'),
      message: `Flipping (${r}, ${c}) joins ${seen.size} island${seen.size === 1 ? '' : 's'} into ${total} cells.` })
  }
  frames.push({ phase: 'done', cell: null, id: id.map(r => [...r]), size: [...size], best, result: best, activeLine: L('return best'), pythonLine: P('return best'), message: `Largest island after at most one flip: ${best}.` })
  return { input: grid, result: best, frames }
}
