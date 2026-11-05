export function parseInput(text) {
  const grid = JSON.parse(text)
  if (!Array.isArray(grid) || grid.length < 3 || grid.length > 7 || grid.length % 2 === 0) throw new Error('Use a JSON grid of odd size from 3 to 7.')
  if (!grid.every(row => Array.isArray(row) && row.length === grid.length && row.every(v => Number.isInteger(v) && v >= 0 && v <= 2))) throw new Error('The grid is square with values 0, 1 or 2.')
  return grid
}

const inY = (i, j, n) => {
  const mid = (n - 1) / 2
  if (j === mid && i >= mid) return true
  return i < mid && (j === i || j === n - 1 - i)
}

export function buildTrace(grid) {
  const frames = []
  const n = grid.length
  const yCounts = [0, 0, 0]
  const otherCounts = [0, 0, 0]
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('const yCounts'), cell: null, yCounts: [...yCounts], otherCounts: [...otherCounts], pair: null, best: null, message: `Split the ${n} by ${n} grid into the Y and the rest.` })
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (inY(i, j, n)) {
        yCounts[grid[i][j]] += 1
        frames.push({ pythonLine: 10, phase: 'y', activeLine: L('const yCounts'), cell: [i, j], yCounts: [...yCounts], otherCounts: [...otherCounts], pair: null, best: null, message: `(${i}, ${j}) is in the Y and holds ${grid[i][j]}.` })
      } else {
        otherCounts[grid[i][j]] += 1
        frames.push({ pythonLine: 12, phase: 'other', activeLine: L('const yCounts'), cell: [i, j], yCounts: [...yCounts], otherCounts: [...otherCounts], pair: null, best: null, message: `(${i}, ${j}) is outside the Y and holds ${grid[i][j]}.` })
      }
    }
  }
  const yTotal = yCounts.reduce((a, b) => a + b, 0)
  const otherTotal = otherCounts.reduce((a, b) => a + b, 0)
  let best = null
  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      if (a === b) continue
      const cost = (yTotal - yCounts[a]) + (otherTotal - otherCounts[b])
      frames.push({ pythonLine: 20, phase: 'pair', activeLine: L('const cost ='), cell: null, yCounts: [...yCounts], otherCounts: [...otherCounts], pair: [a, b], best, message: `Y becomes ${a} and the rest becomes ${b}: ${cost} changes.` })
      if (best === null || cost < best) {
        best = cost
        frames.push({ pythonLine: 22, phase: 'improve', activeLine: L('if (best === null || cost < best)'), cell: null, yCounts: [...yCounts], otherCounts: [...otherCounts], pair: [a, b], best, message: `${cost} changes is the best so far.` })
      }
    }
  }
  frames.push({ pythonLine: 23, phase: 'done', activeLine: L('return best'), cell: null, yCounts: [...yCounts], otherCounts: [...otherCounts], pair: null, best, message: `Minimum operations: ${best}.` })
  return { input: grid, result: best, frames }
}

export const code = `function minOperationsToWriteY(grid) {
  const n = grid.length
  const mid = (n - 1) / 2
  const inY = (i, j) => (j === mid && i >= mid) || (i < mid && (j === i || j === n - 1 - i))
  const yCounts = [0, 0, 0]
  const otherCounts = [0, 0, 0]
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (inY(i, j)) yCounts[grid[i][j]] += 1
      else otherCounts[grid[i][j]] += 1
    }
  }
  const yTotal = yCounts.reduce((x, y) => x + y, 0)
  const otherTotal = otherCounts.reduce((x, y) => x + y, 0)
  let best = null
  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      if (a === b) continue
      const cost = (yTotal - yCounts[a]) + (otherTotal - otherCounts[b])
      if (best === null || cost < best) best = cost
    }
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_ops(grid):
    n = len(grid)
    mid = n // 2
    y_counts = [0, 0, 0]
    other_counts = [0, 0, 0]
    for i in range(n):
        for j in range(n):
            in_y = (j == mid and i >= mid) or (i < mid and (j == i or j == n - 1 - i))
            if in_y:
                y_counts[grid[i][j]] += 1
            else:
                other_counts[grid[i][j]] += 1
    y_total = sum(y_counts)
    other_total = sum(other_counts)
    best = None
    for a in range(3):
        for b in range(3):
            if a == b:
                continue
            cost = (y_total - y_counts[a]) + (other_total - other_counts[b])
            if best is None or cost < best:
                best = cost
    return best
`
