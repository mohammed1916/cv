export const phases = [
  { id: 'bucket', label: 'Place values', description: 'Put each value into the bucket for its diagonal, the sum of its row and column numbers.' },
  { id: 'order', label: 'Next diagonal', description: 'Visit the diagonals in increasing order of their sums.' },
  { id: 'emit', label: 'Read diagonal', description: 'Read a diagonal from its bottom-left cell up to its top-right cell.' },
  { id: 'result', label: 'Result', description: 'Return every value in diagonal order.' },
]

export const python = `def find_diagonal_order(nums):
    buckets = {}
    for i in range(len(nums)):
        for j in range(len(nums[i])):
            d = i + j
            if d not in buckets: buckets[d] = []
            buckets[d].append(nums[i][j])


    result = []
    for d in sorted(buckets):
        row = buckets[d]
        for k in range(len(row) - 1, -1, -1): result.append(row[k])

    return result
`

const pythonLines = python.split('\n')
export const code = `function findDiagonalOrder(nums) {
  const buckets = new Map()
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < nums[i].length; j++) {
      const d = i + j
      if (!buckets.has(d)) buckets.set(d, [])
      buckets.get(d).push(nums[i][j])
    }
  }
  const result = []
  for (const d of [...buckets.keys()].sort((a, b) => a - b)) {
    const list = buckets.get(d)
    for (let k = list.length - 1; k >= 0; k--) result.push(list[k])
  }
  return result
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
export const pythonLineMap = Object.fromEntries(pythonLines.map((_, index) => [index + 1, index + 1]))

export function parseInput(text) {
  let value
  try { value = JSON.parse(text) } catch { throw new Error('Enter a JSON array of rows, such as [[1, 2], [3]].') }
  if (!Array.isArray(value) || value.length < 1 || value.length > 50) throw new Error('Use 1 to 50 rows.')
  value.forEach((row, i) => {
    if (!Array.isArray(row) || row.length < 1 || row.length > 50) throw new Error(`Row ${i + 1} must hold 1 to 50 values.`)
    if (!row.every(Number.isInteger)) throw new Error(`Row ${i + 1} must contain only integers.`)
  })
  return value
}

export function buildTrace(nums) {
  const frames = []
  const buckets = new Map()
  const output = []
  const push = (phase, activeLine, message, cell = null, diagonal = -1) => frames.push({
    phase, activeLine, message,
    snapshot: { cell, diagonal, output: [...output], buckets: Object.fromEntries([...buckets].map(([d, list]) => [d, [...list]])) },
  })

  push('bucket', 2, `Set up empty buckets for the ${nums.length} rows.`)
  nums.forEach((row, i) => {
    row.forEach((value, j) => {
      const d = i + j
      if (!buckets.has(d)) buckets.set(d, [])
      buckets.get(d).push(value)
      push('bucket', 7, `Cell (${i}, ${j}) holds ${value}. It goes to diagonal ${d}.`, [i, j], d)
    })
  })

  for (const d of [...buckets.keys()].sort((a, b) => a - b)) {
    push('order', 11, `Next diagonal: sum ${d}.`, null, d)
    const list = buckets.get(d)
    for (let k = list.length - 1; k >= 0; k--) {
      output.push(list[k])
      push('emit', 13, `Diagonal ${d}: read ${list[k]} and move up and to the right.`, null, d)
    }
  }

  push('result', 15, `Done: ${output.length} values in diagonal order.`)
  return { input: nums, result: output, frames }
}
