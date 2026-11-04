const CODE = [
  'function evenProductSubarrays(nums) {',
  '  let count = 0, lastEven = -1',
  '  for (let i = 0; i < nums.length; i++) {',
  '    if (nums[i] % 2 === 0) lastEven = i',
  '    count += lastEven + 1',
  '  }',
  '  return count',
  '}',
]

const PY = [
  'def even_product_subarrays(nums):',
  '    count = 0',
  '    last_even = -1',
  '    for i, v in enumerate(nums):',
  '        if v % 2 == 0:',
  '            last_even = i',
  '        count += last_even + 1',
  '    return count',
]

const at = (lines, text) => {
  const index = lines.findIndex(line => line.trim() === text.trim())
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}
const codeLine = text => at(CODE, text)
const pyLine = text => at(PY, text)

export const phases = [
  { id: 'start', label: 'Start', description: 'No subarray counted yet; no even value seen.' },
  { id: 'even', label: 'Even', description: 'An even value makes every subarray ending here even.' },
  { id: 'odd', label: 'Odd', description: 'Only subarrays starting at or before the last even value qualify.' },
  { id: 'done', label: 'Result', description: 'The total of all endings.' },
]

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums has 1 to 12 values in this visualization.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 20)) throw new Error('Values are integers from 1 to 20 in this visualization.')
  return nums
}

export function buildTrace(nums) {
  let count = 0
  let lastEven = -1
  const frames = []
  frames.push({ pythonLine: pyLine('last_even = -1'), phase: 'start', activeLine: codeLine('let count = 0, lastEven = -1'), i: null, lastEven, added: 0, count, message: 'No subarray is counted yet. No even value has been seen.' })
  nums.forEach((v, i) => {
    const even = v % 2 === 0
    if (even) lastEven = i
    const added = lastEven + 1
    count += added
    frames.push({ pythonLine: pyLine(even ? 'last_even = i' : 'count += last_even + 1'), phase: even ? 'even' : 'odd', activeLine: codeLine(even ? 'if (nums[i] % 2 === 0) lastEven = i' : 'count += lastEven + 1'), i, lastEven, added, count, message: even
      ? `${v} is even, so all ${added} subarrays ending at index ${i} have an even product. Total ${count}.`
      : `${v} is odd. Subarrays ending at ${i} start at 0 to ${lastEven} to contain an even value: ${added} of them. Total ${count}.` })
  })
  frames.push({ pythonLine: pyLine('return count'), phase: 'done', activeLine: codeLine('return count'), i: null, lastEven, added: 0, count, message: `${count} subarray${count === 1 ? '' : 's'} have an even product.` })
  return { input: nums, result: count, frames }
}

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n') + '\n'
