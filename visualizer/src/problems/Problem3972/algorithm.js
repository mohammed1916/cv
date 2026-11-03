const MAX_LEN = 12
const MAX_ABS = 9

function lookup(lines, text) {
  const index = lines.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and x.')
  const { nums, x } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_LEN) throw new Error(`nums has 1 to ${MAX_LEN} entries.`)
  if (nums.some(v => !Number.isInteger(v) || Math.abs(v) > MAX_ABS)) throw new Error(`Each entry is an integer from -${MAX_ABS} to ${MAX_ABS}.`)
  if (!Number.isInteger(x) || x < 0 || x > 9) throw new Error('x is a single decimal digit from 0 to 9.')
  return { nums, x }
}

export function buildTrace({ nums, x }) {
  const L = text => lookup(code, text)
  const P = text => lookup(pyLines, text)
  const n = nums.length
  const frames = []
  let count = 0
  frames.push({ pythonLine: P('count = 0'), phase: 'start', activeLine: L('count = 0'), start: null, end: null, total: null, count, message: `Count subarrays whose positive sum starts and ends with ${x}.` })
  for (let start = 0; start < n; start++) {
    let total = 0
    frames.push({ pythonLine: P('for start in range'), phase: 'begin', activeLine: L('for each start index'), start, end: null, total: 0, count, message: `Begin subarrays at index ${start}.` })
    for (let end = start; end < n; end++) {
      total += nums[end]
      const text = String(total)
      const digitsMatch = total > 0 && text[0] === String(x) && text[text.length - 1] === String(x)
      frames.push({ pythonLine: P('total += nums[end]'), phase: 'extend', activeLine: L('total = total + nums'), start, end, total, count, message: `Sum of nums[${start}..${end}] is ${total}.` })
      if (digitsMatch) {
        count += 1
        frames.push({ pythonLine: P('count += 1'), phase: 'match', activeLine: L('then count += 1'), start, end, total, count, message: `${total} is positive and both its digits are ${x}; count rises to ${count}.` })
      } else {
        frames.push({ pythonLine: P('if total > 0 and'), phase: 'miss', activeLine: L('if total > 0 and'), start, end, total, count, message: total > 0 ? `${total} does not start and end with ${x}.` : `${total} is not positive, so it does not count.` })
      }
    }
  }
  frames.push({ pythonLine: P('return count'), phase: 'done', activeLine: L('return count'), start: null, end: null, total: null, count, message: `${count} subarray${count === 1 ? '' : 's'} match.` })
  return { input: { nums, x }, result: count, frames }
}

export const code = `count subarrays whose positive sum starts and ends with digit x
  count = 0
  for each start index
    total = 0
    for each end index from start on
      total = total + nums[end]
      if total > 0 and first and last digit of total equal x then count += 1
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def count_matching_subarrays(nums, x):
    count = 0
    for start in range(len(nums)):
        total = 0
        for end in range(start, len(nums)):
            total += nums[end]
            text = str(total)
            if total > 0 and text[0] == str(x) and text[-1] == str(x):
                count += 1
    return count
`

const pyLines = python.split('\n').map((text, index) => ({ line: index + 1, text }))
