export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with an empty answer and a total of 0.' },
  { id: 'accumulate', label: 'Add value', description: 'Add the current value to the total and record the total.' },
  { id: 'done', label: 'Complete', description: 'Every position holds its prefix sum.' },
]

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 200) throw new Error('Enter a JSON array of 1 to 200 integers.')
  if (!nums.every(v => Number.isInteger(v) && v >= -1000 && v <= 1000)) throw new Error('Every value must be an integer from -1000 to 1000.')
  return nums
}

export const code = `running sum (nums):
  result = empty list
  total = 0
  for each value in nums, from left to right:
    total = total + value
    append total to result
  return result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def running_sum(nums):
    result = []
    total = 0
    for value in nums:
        total += value
        result.append(total)
    return result
`

export function buildTrace(nums) {
  const frames = []
  const output = []
  let total = 0
  frames.push({
    phase: 'start', activeLine: L('result = empty list'), pythonLine: P('result = []'),
    cursor: -1, total: 0, output: [], message: 'Start with an empty answer and a running total of 0. Nothing has been read yet.',
  })
  for (let i = 0; i < nums.length; i++) {
    const before = total
    total += nums[i]
    output.push(total)
    frames.push({
      phase: 'accumulate', activeLine: L('total = total + value'), pythonLine: P('total += value'),
      cursor: i, total, output: [...output], before,
      message: `Read ${nums[i]} at position ${i}. The total becomes ${before} + ${nums[i]} = ${total}, and that is the answer at position ${i}.`,
    })
  }
  frames.push({
    phase: 'done', activeLine: L('return result'), pythonLine: P('return result'),
    cursor: -1, total, output: [...output], before: null,
    message: `Every position now holds the sum of its whole prefix: ${output.join(', ')}.`,
  })
  return { input: nums, result: output, frames }
}
