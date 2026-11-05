// LeetCode 2121: Intervals Between Identical Elements.
// For each value, sort its positions p0 < p1 < ... . The sum of distances from position pj to the others is
// (pj * j - sum of earlier positions) + (sum of later positions - pj * count of later positions).
// Running prefix sums over each group give every answer in linear time.

export function parseInput(text) {
  let arr
  try { arr = JSON.parse(text) } catch { throw new Error('Use a JSON array of integers, e.g. [2,5,2,4,5].') }
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 30 || arr.some(v => !Number.isInteger(v) || v < 1 || v > 20)) {
    throw new Error('Use 1 to 30 integers from 1 to 20.')
  }
  return { arr }
}

export const code = `function identicalIntervals(arr) {
  const groups = new Map()
  arr.forEach((value, index) => {
    if (!groups.has(value)) groups.set(value, [])
    groups.get(value).push(index)
  })
  const result = new Array(arr.length).fill(0)
  for (const positions of groups.values()) {
    const total = positions.reduce((sum, p) => sum + p, 0)
    let before = 0
    for (let j = 0; j < positions.length; j++) {
      const p = positions[j]
      const after = total - before - p
      const leftCount = j
      const rightCount = positions.length - 1 - j
      result[p] = (p * leftCount - before) + (after - p * rightCount)
      before += p
    }
  }
  return result
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: identical_intervals
def identical_intervals(arr):
    groups = {}
    for index, value in enumerate(arr):
        groups.setdefault(value, []).append(index)
    result = [0] * len(arr)
    for positions in groups.values():
        total = sum(positions)
        before = 0
        for j, p in enumerate(positions):
            after = total - before - p
            left_count = j
            right_count = len(positions) - 1 - j
            result[p] = (p * left_count - before) + (after - p * right_count)
            before += p
    return result
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'group', label: 'Group positions', description: 'Collect the positions of each value in increasing order.' },
  { id: 'sweep', label: 'Sweep group', description: 'Walk one group left to right, keeping the sum of earlier positions.' },
  { id: 'done', label: 'Result', description: 'Every position now has its interval sum.' },
]

export function buildTrace({ arr }) {
  const frames = []
  const groups = new Map()
  arr.forEach((value, index) => {
    if (!groups.has(value)) groups.set(value, [])
    groups.get(value).push(index)
  })
  frames.push({ phase: 'group', activeLine: L('const groups = new Map'), pythonLine: P('groups = {}'), message: `${groups.size} distinct values; each group lists its positions.`, groups: [...groups].map(([value, positions]) => ({ value, positions })), current: null, result: new Array(arr.length).fill(null), marks: {} })
  const result = new Array(arr.length).fill(0)
  for (const [value, positions] of groups) {
    const total = positions.reduce((sum, p) => sum + p, 0)
    let before = 0
    for (let j = 0; j < positions.length; j++) {
      const p = positions[j]
      const after = total - before - p
      const leftCount = j
      const rightCount = positions.length - 1 - j
      result[p] = (p * leftCount - before) + (after - p * rightCount)
      const marks = Object.fromEntries(positions.map(q => [q, 'same']))
      marks[p] = 'current'
      frames.push({ phase: 'sweep', activeLine: L('result[p] ='), pythonLine: P('result[p] = '), message: `Value ${value} at ${p}: ${leftCount} earlier and ${rightCount} later matches; interval sum ${result[p]}.`, groups: [...groups].map(([v, pos]) => ({ value: v, positions: pos })), current: p, result: result.map((x, i) => (positions.includes(i) || x !== 0 ? x : null)), marks, value })
      before += p
    }
  }
  frames.push({ phase: 'done', activeLine: L('return result'), pythonLine: P('return result'), message: `Interval sums: ${result.join(', ')}.`, groups: [...groups].map(([v, pos]) => ({ value: v, positions: pos })), current: null, result, marks: {} })
  return { input: { arr }, result, frames }
}
