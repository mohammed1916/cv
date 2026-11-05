export const phases = [
  { id: 'start', label: 'Split halves', description: 'The first n values form the x half and the next n values form the y half.' },
  { id: 'take-x', label: 'Take x', description: 'Append the next value from the first half.' },
  { id: 'take-y', label: 'Take y', description: 'Append the matching value from the second half.' },
  { id: 'done', label: 'Complete', description: 'Return the interleaved list.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and n, such as {"nums": [1, 2, 3, 4], "n": 2}.')
  const { nums, n } = input
  if (!Number.isInteger(n) || n < 1 || n > 500) throw new Error('n is an integer from 1 to 500.')
  if (!Array.isArray(nums) || nums.length !== 2 * n || !nums.every(v => Number.isInteger(v) && v >= 1 && v <= 1000)) {
    throw new Error('nums must hold 2n integers from 1 to 1000.')
  }
  return { nums, n }
}

const at = (activeLine, pythonLine = activeLine) => ({ activeLine, pythonLine })

export function buildTrace({ nums, n }) {
  const result = []
  const frames = [{ phase: 'start', ...at(2, 2), snapshot: { i: null, xIndex: null, yIndex: null, result: [] }, message: `First half: positions 0 to ${n - 1}. Second half: positions ${n} to ${2 * n - 1}.` }]
  for (let i = 0; i < n; i++) {
    result.push(nums[i])
    frames.push({ phase: 'take-x', ...at(4, 4), snapshot: { i, xIndex: i, yIndex: null, result: [...result] }, message: `Round ${i + 1}: append x = ${nums[i]} from position ${i}.` })
    result.push(nums[n + i])
    frames.push({ phase: 'take-y', ...at(5, 5), snapshot: { i, xIndex: i, yIndex: n + i, result: [...result] }, message: `Append y = ${nums[n + i]} from position ${n + i}.` })
  }
  frames.push({ phase: 'done', ...at(7, 7), snapshot: { i: null, xIndex: null, yIndex: null, result: [...result] }, message: `Return [${result.join(', ')}].` })
  return { input: { nums, n }, result, frames }
}

export const code = `function shuffle(nums, n) {
  const result = []
  for (let i = 0; i < n; i++) {
    result.push(nums[i])
    result.push(nums[n + i])
  }
  return result
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def shuffle(nums, n):
    result = []
    for i in range(n):
        result.append(nums[i])
        result.append(nums[n + i])

    return result
`
