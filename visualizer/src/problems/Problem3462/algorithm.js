export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with grid, limits and k.')
  const { grid, limits, k } = input
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 5) throw new Error('grid is an n by n matrix with n from 1 to 5.')
  const n = grid.length
  if (!grid.every(row => Array.isArray(row) && row.length === n && row.every(v => Number.isInteger(v) && v >= 0 && v <= 9))) throw new Error('grid is n by n with values from 0 to 9.')
  if (!Array.isArray(limits) || limits.length !== n || !limits.every(v => Number.isInteger(v) && v >= 0 && v <= n)) throw new Error('limits has n values, each from 0 to n.')
  if (!Number.isInteger(k) || k < 0 || k > n * n) throw new Error('k is an integer from 0 to n * n.')
  return { grid, limits, k }
}

// Within one row, taking j cells means taking the j largest, so each row keeps only its top limits[i]
// values. Then the best k overall is the k largest of those candidates, stopping at non-positive values.
export function buildTrace({ grid, limits, k }) {
  const frames = []
  const candidates = []
  frames.push({ pythonLine: PY('candidates = []'), phase: 'start', activeLine: L('collect candidates'), row: -1, candidates: [], total: 0, message: 'Collect the best values each row may contribute.' })
  for (let r = 0; r < grid.length; r++) {
    const top = [...grid[r]].sort((a, b) => b - a).slice(0, limits[r])
    candidates.push(...top)
    frames.push({ pythonLine: PY('best_in_row = sorted'), phase: 'row', activeLine: L('keep the largest values in this row'), row: r, candidates: [...candidates], total: 0,
      message: `Row ${r} may give at most ${limits[r]}: keep ${top.join(', ') || 'nothing'}.` })
  }
  candidates.sort((a, b) => b - a)
  frames.push({ pythonLine: PY('candidates.sort'), phase: 'sort', activeLine: L('sort all candidates'), row: -1, candidates: [...candidates], total: 0, message: `Sort the candidates: ${candidates.join(', ') || 'none'}.` })
  let total = 0
  for (let i = 0; i < Math.min(k, candidates.length); i++) {
    const value = candidates[i]
    if (value <= 0) {
      frames.push({ pythonLine: PY('if value <= 0'), phase: 'stop', activeLine: L('stop at a non-positive value'), row: -1, candidates: [...candidates], total, index: i, message: `${value} is not positive; stop.` })
      break
    }
    total += value
    frames.push({ pythonLine: PY('total += value'), phase: 'take', activeLine: L('add the value'), row: -1, candidates: [...candidates], total, index: i, message: `Take ${value}; total ${total}.` })
  }
  frames.push({ pythonLine: PY('return total'), phase: 'done', activeLine: L('return the total'), row: -1, candidates: [...candidates], total, result: total, message: `Maximum sum is ${total}.` })
  return { input: { grid, limits, k }, result: total, frames }
}

export const code = `maximum sum choosing at most limits[i] cells from row i and at most k cells overall
  candidates is an empty list
  for each row i
    keep the limits[i] largest values of the row as candidates
  sort candidates from largest to smallest
  total is 0
  for the first k candidates
    if the candidate is not positive, stop
    add it to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_sum_with_at_most_k(grid, limits, k):
    candidates = []
    for row, limit in zip(grid, limits):
        best_in_row = sorted(row, reverse=True)[:limit]
        candidates.extend(best_in_row)
    candidates.sort(reverse=True)
    total = 0
    for value in candidates[:k]:
        if value <= 0:
            break
        total += value
    return total
`
const PY = s => python.split('\n').findIndex(line => line.includes(s)) + 1
