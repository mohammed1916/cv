export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n and buildings.')
  const { n, buildings } = input
  if (!Number.isInteger(n) || n < 2 || n > 12) throw new Error('n is an integer from 2 to 12.')
  if (!Array.isArray(buildings) || buildings.length < 1 || buildings.length > 30) throw new Error('buildings holds 1 to 30 [x, y] pairs.')
  const seen = new Set()
  for (const pair of buildings) {
    if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(v => Number.isInteger(v) && v >= 1 && v <= n)) throw new Error('Each building is [x, y] inside the n by n grid.')
    const key = pair.join(',')
    if (seen.has(key)) throw new Error('Buildings are at distinct positions.')
    seen.add(key)
  }
  return { n, buildings }
}

export function buildTrace({ n, buildings }) {
  const frames = []
  const rowMin = new Map(), rowMax = new Map(), colMin = new Map(), colMax = new Map()
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('start with empty row and column extremes'), at: -1, covered: [], message: 'No row or column has been measured yet.' })
  for (const [x, y] of buildings) {
    rowMin.set(y, Math.min(rowMin.get(y) ?? x, x))
    rowMax.set(y, Math.max(rowMax.get(y) ?? x, x))
    colMin.set(x, Math.min(colMin.get(x) ?? y, y))
    colMax.set(x, Math.max(colMax.get(x) ?? y, y))
  }
  frames.push({ pythonLine: 10, phase: 'extremes', activeLine: L('record the leftmost and rightmost'), at: -1, covered: [], message: `Recorded the outermost buildings of ${rowMin.size} rows and ${colMin.size} columns.` })
  let count = 0
  const covered = []
  buildings.forEach(([x, y], index) => {
    const ok = rowMin.get(y) < x && x < rowMax.get(y) && colMin.get(x) < y && y < colMax.get(x)
    frames.push({ pythonLine: 13, phase: 'check', activeLine: L('if the building has neighbours'), at: index, covered: [...covered], ok, message: ok
      ? `${x},${y} has a building on all four sides.`
      : `${x},${y} is an outer building in its row or column.` })
    if (ok) {
      count += 1
      covered.push(index)
      frames.push({ pythonLine: 14, phase: 'count', activeLine: L('add one to the count'), at: index, covered: [...covered], ok, message: `Covered buildings: ${count}.` })
    }
  })
  frames.push({ pythonLine: 15, phase: 'done', activeLine: L('return the count'), at: -1, covered: [...covered], message: `${count} buildings are covered.` })
  return { input: { n, buildings }, result: count, frames }
}

export const code = `count the buildings that have a building on all four sides
  start with empty row and column extremes
  for each building record the leftmost and rightmost building in its row
  and the lowest and highest building in its column
  count = 0
  for each building if the building has neighbours strictly inside its row and column extremes then add one to the count
  return the count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_covered(n, buildings):
    row_min = {}
    row_max = {}
    col_min = {}
    col_max = {}
    for x, y in buildings:
        row_min[y] = min(row_min.get(y, x), x)
        row_max[y] = max(row_max.get(y, x), x)
        col_min[x] = min(col_min.get(x, y), y)
        col_max[x] = max(col_max.get(x, y), y)
    count = 0
    for x, y in buildings:
        if row_min[y] < x < row_max[y] and col_min[x] < y < col_max[x]:
            count += 1
    return count
`
