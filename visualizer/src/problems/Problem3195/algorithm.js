export function parseInput(text) {
  const grid = JSON.parse(text)
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 6) throw new Error('Enter a grid of 1 to 6 rows.')
  const cols = grid[0]?.length ?? 0
  if (cols < 1 || cols > 6) throw new Error('Each row has 1 to 6 cells.')
  for (const row of grid) {
    if (!Array.isArray(row) || row.length !== cols || !row.every(v => v === 0 || v === 1)) throw new Error('Cells are 0 or 1, and all rows have the same length.')
  }
  if (!grid.some(row => row.includes(1))) throw new Error('The grid needs at least one 1.')
  return grid
}

export function buildTrace(grid) {
  let top = Infinity, bottom = -1, left = Infinity, right = -1
  const frames = [{ phase: 'start', row: null, box: null, area: null, activeLine: L('set top to'), message: 'Track the smallest and largest row and column that contain a 1.' }]
  grid.forEach((row, r) => {
    row.forEach((v, c) => {
      if (v !== 1) return
      top = Math.min(top, r); bottom = Math.max(bottom, r)
      left = Math.min(left, c); right = Math.max(right, c)
    })
    if (row.includes(1)) {
      const area = (bottom - top + 1) * (right - left + 1)
      frames.push({ phase: 'row', row: r, box: { top, bottom, left, right }, area, activeLine: L('for each cell'), message: `Row ${r} has 1s; the box is rows ${top}-${bottom}, columns ${left}-${right}, area ${area}.` })
    }
  })
  const area = (bottom - top + 1) * (right - left + 1)
  frames.push({ phase: 'done', row: null, box: { top, bottom, left, right }, area, activeLine: L('return the area'), message: `Minimum covering area: ${area}.` })
  return { input: grid, result: area, frames }
}

export const code = `minimum area of one rectangle covering all ones
  set top to infinity and bottom to minus one, and likewise for left and right
  for each cell (r, c) in the grid
    if the cell is 1 then
      lower top, raise bottom, lower left and raise right to include (r, c)
  return the area of the box (bottom - top + 1) times (right - left + 1)`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_area(grid):
    top = left = float('inf')
    bottom = right = -1
    for r, row in enumerate(grid):
        for c, v in enumerate(row):
            if v == 1:
                top = min(top, r)
                bottom = max(bottom, r)
                left = min(left, c)
                right = max(right, c)
    return (bottom - top + 1) * (right - left + 1)
`
