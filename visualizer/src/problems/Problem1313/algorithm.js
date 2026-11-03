export const phases = [
  { id: 'read', label: 'Read a pair', description: 'Take the next pair: the first number is how many times to repeat, the second is the value.' },
  { id: 'expand', label: 'Append copies', description: 'Append the value to the output that many times, keeping the pairs in order.' },
  { id: 'done', label: 'Complete', description: 'The output holds every expanded value in order.' },
]

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 20 || nums.length % 2 !== 0) throw new Error('Use a JSON array of an even number of integers, 2 to 20 values long.')
  for (let i = 0; i < nums.length; i += 2) {
    if (!Number.isInteger(nums[i]) || nums[i] < 1 || nums[i] > 6) throw new Error('Each frequency is an integer from 1 to 6.')
    if (!Number.isInteger(nums[i + 1]) || nums[i + 1] < 1 || nums[i + 1] > 100) throw new Error('Each value is an integer from 1 to 100.')
  }
  return nums
}

export function buildTrace(nums) {
  const frames = []
  const out = []
  frames.push({ phase: 'read', activeLine: L('out = empty list'), pythonLine: P('out = []'), snapshot: { nums, pair: -1, out: [] },
    message: `${nums.length / 2} pairs to expand. The output starts empty.` })
  for (let i = 0; i < nums.length; i += 2) {
    const freq = nums[i], value = nums[i + 1]
    frames.push({ phase: 'read', activeLine: L('freq = nums[i]'), pythonLine: P('for i in range'), snapshot: { nums, pair: i, out: [...out] },
      message: `Pair ${i / 2 + 1} is (${freq}, ${value}): repeat ${value} ${freq} time${freq === 1 ? '' : 's'}.` })
    for (let k = 0; k < freq; k++) out.push(value)
    frames.push({ phase: 'expand', activeLine: L('append value freq'), pythonLine: P('out.extend'), snapshot: { nums, pair: i, out: [...out] },
      message: `Appended ${value} ${freq} time${freq === 1 ? '' : 's'}. The output now has ${out.length} values.` })
  }
  frames.push({ phase: 'done', activeLine: L('return out'), pythonLine: P('return out'), snapshot: { nums, pair: -1, out: [...out] },
    message: `Expanded list: ${out.join(', ')}.` })
  return { input: nums, result: out, frames }
}

export const code = `decompress(nums):
  out = empty list
  for i from 0 to length - 1 in steps of 2:
    freq = nums[i]
    value = nums[i + 1]
    append value freq times to out
  return out`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def decompress_rle_list(nums):
    out = []
    for i in range(0, len(nums), 2):
        out.extend([nums[i + 1]] * nums[i])
    return out`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
