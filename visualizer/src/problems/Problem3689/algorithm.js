const L = s => code.findIndex(c => c.text.includes(s)) + 1
const PY = s => python.split('\n').findIndex(line => line.includes(s)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 20 || !nums.every(v => Number.isInteger(v) && v >= -100 && v <= 100)) throw new Error('nums has 1 to 20 integers from -100 to 100.')
  if (!Number.isInteger(k) || k < 1 || k > 10) throw new Error('k is an integer from 1 to 10.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const frames = []
  const largest = Math.max(...nums)
  const smallest = Math.min(...nums)
  const last = nums.length - 1
  frames.push({ pythonLine: PY('largest = max'), phase: 'range', activeLine: L('largest and smallest'), chosen: null, largest, smallest, total: 0,
    message: `The largest value is ${largest} and the smallest is ${smallest}.` })
  frames.push({ pythonLine: PY('return k *'), phase: 'pick', activeLine: L('whole array'), chosen: [0, last], largest, smallest, total: k * (largest - smallest),
    message: `The whole array has the widest range, ${largest - smallest}. Choosing it ${k} time${k === 1 ? '' : 's'} gives the total.` })
  const result = k * (largest - smallest)
  frames.push({ pythonLine: PY('return k *'), phase: 'done', activeLine: L('return'), chosen: null, largest, smallest, total: result,
    message: `Maximum total value: ${result}.` })
  return { input: { nums, k }, result, frames }
}

export const code = [
  'maximum total value of k chosen subarrays',
  '  find the largest and smallest values in nums',
  '  the whole array has the widest range of any subarray',
  '  every chosen subarray can be the whole array',
  '  return k times (largest minus smallest)',
].map((text, index) => ({ line: index + 1, text }))

export const python = `def max_total_value(nums, k):
    largest = max(nums)
    smallest = min(nums)
    return k * (largest - smallest)
`
