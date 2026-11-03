export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with the original values and an empty rank table.' },
  { id: 'sort', label: 'Sort distinct values', description: 'Duplicates share one rank, so only the distinct values are ordered.' },
  { id: 'assign', label: 'Assign ranks', description: 'Walk the sorted distinct values. The first gets rank 1, the next rank 2, and so on.' },
  { id: 'map', label: 'Map each value', description: 'Replace every original value with the rank stored for it.' },
  { id: 'done', label: 'Complete', description: 'Return the rank of each original position.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input) || input.length > 12) throw new Error('Use a JSON array of at most 12 integers, such as [40, 10, 20].')
  if (!input.every(v => Number.isInteger(v) && v >= -20 && v <= 20)) throw new Error('Each value is an integer from -20 to 20.')
  return { arr: input }
}

export function buildTrace({ arr }) {
  const ordered = [...new Set(arr)].sort((x, y) => x - y)
  const rank = new Map()
  const pairs = () => [...rank].map(([value, r]) => ({ value, rank: r }))
  const snap = (extra = {}) => ({ ordered: [...ordered], pairs: pairs(), ...extra })
  const frames = [{ phase: 'start', activeLine: L('ordered = sorted'), pythonLine: P('ordered = sorted'), snapshot: snap(), message: `Values ${arr.join(', ') || '(none)'}. Equal values will share a rank.` }]
  frames.push({ phase: 'sort', activeLine: L('ordered = sorted'), pythonLine: P('ordered = sorted'), snapshot: snap(), message: `Distinct values in ascending order: ${ordered.join(', ') || 'none'}.` })
  ordered.forEach((value, index) => {
    rank.set(value, index + 1)
    frames.push({ phase: 'assign', activeLine: L('rank[ordered[r - 1]] = r'), pythonLine: P('rank = {'), snapshot: snap({ current: value }), message: `${value} is the ${index + 1}-th smallest distinct value, so its rank is ${index + 1}.` })
  })
  const output = []
  for (const value of arr) {
    output.push(rank.get(value))
    frames.push({ phase: 'map', activeLine: L('output the rank'), pythonLine: P('return [rank'), snapshot: snap({ current: value, output: [...output] }), message: `${value} maps to rank ${rank.get(value)}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return the ranks'), pythonLine: P('return [rank'), snapshot: snap({ output: [...output] }), message: `Result: [${output.join(', ')}].` })
  return { input: { arr }, result: output, frames }
}

export const code = `rank transform (arr):
  ordered = sorted distinct values of arr
  rank = empty map
  for r from 1 to count of ordered:
    rank[ordered[r - 1]] = r
  for each value v in arr:
    output the rank of v
  return the ranks`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def array_rank_transform(arr):
    ordered = sorted(set(arr))
    rank = {value: r for r, value in enumerate(ordered, start=1)}
    return [rank[v] for v in arr]
`
