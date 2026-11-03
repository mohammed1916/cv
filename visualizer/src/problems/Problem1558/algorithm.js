export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with a count of zero and the target array.' },
  { id: 'bits', label: 'Count set bits', description: 'Each element needs one single increment for every 1 bit in its binary form.' },
  { id: 'doublings', label: 'Count doublings', description: 'Doubling every element at once shifts all bits left, so the largest value fixes how many doublings are needed.' },
  { id: 'done', label: 'Complete', description: 'Add the increments and the doublings.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"nums": [3, 5, 1]}.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12 || !nums.every(v => Number.isInteger(v) && v >= 0 && v <= 60)) {
    throw new Error('nums is a list of 1 to 12 integers from 0 to 60.')
  }
  return { nums }
}

export function buildTrace({ nums }) {
  const bits = nums.map(v => v.toString(2))
  const ones = bits.map(b => [...b].filter(c => c === '1').length)
  const snap = (index, total, doublings) => ({ index, values: nums, binary: bits, ones, total, doublings })
  const frames = [{
    phase: 'start', activeLine: L('increments = 0'), pythonLine: P('increments = 0'),
    snapshot: snap(-1, 0, null),
    message: `Target ${nums.join(', ')}. Each element needs one increment for every set bit in its binary form.`,
  }]
  let total = 0
  nums.forEach((value, i) => {
    total += ones[i]
    frames.push({
      phase: 'bits', activeLine: L('increments += number'), pythonLine: P('increments += bin(value)'),
      snapshot: snap(i, total, null),
      message: `${value} is ${bits[i]} in binary with ${ones[i]} set bit${ones[i] === 1 ? '' : 's'}. The running increment total is ${total}.`,
    })
  })
  const max = Math.max(...nums)
  const doublings = Math.max(0, max.toString(2).length - 1)
  frames.push({
    phase: 'doublings', activeLine: L('doublings = max'), pythonLine: P('doublings = max'),
    snapshot: snap(nums.length, total, doublings),
    message: max === 0
      ? 'Every value is zero, so no doublings are needed.'
      : `The largest value ${max} has ${max.toString(2).length} binary digits, so ${doublings} global doubling${doublings === 1 ? '' : 's'} are needed.`,
  })
  const result = total + doublings
  frames.push({
    phase: 'done', activeLine: L('return increments + doublings'), pythonLine: P('return increments + doublings'),
    snapshot: snap(nums.length, total, doublings), message: `${total} increments plus ${doublings} doublings gives ${result}.`,
  })
  return { input: { nums }, result, frames }
}

export const code = `minimum operations (nums):
  increments = 0
  for each value in nums:
    increments += number of 1 bits in value
  doublings = max(0, bit length of largest value - 1)
  return increments + doublings`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def min_operations(nums):
    increments = 0
    for value in nums:
        increments += bin(value).count("1")
    doublings = max(0, max(nums).bit_length() - 1)
    return increments + doublings
`
