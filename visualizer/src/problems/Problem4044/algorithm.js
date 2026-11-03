// Rotation by shift s reads the window of positions s .. s+h-1 (mod n) as its first half.
// The window sum slides by one position per shift: remove the value that left, add the value that entered.
// A rotation is good when its first half sum is strictly greater than its second half sum.

const MAX_LENGTH = 20

const codeLines = [
  'h is half of n',
  'total is the sum of all values',
  'first is the sum of positions 0 to h minus 1',
  'count is 0',
  'for each shift s from 0 to n minus 1',
  '  if s is above 0, slide the window by one',
  '  if first is greater than total minus first',
  '    add one to count',
  'return count',
]

export const code = codeLines.map((text, index) => ({ line: index + 1, text }))

const L = fragment => {
  const index = codeLines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`Missing pseudocode line: ${fragment}`)
  return index + 1
}

const pythonLines = [
  'def count_good_rotations(nums):',
  '    n = len(nums)',
  '    h = n // 2',
  '    total = sum(nums)',
  '    first = sum(nums[:h])',
  '    count = 0',
  '    for s in range(n):',
  '        if s > 0:',
  '            first = first - nums[(s - 1) % n] + nums[(s + h - 1) % n]',
  '        if first > total - first:',
  '            count += 1',
  '    return count',
]

export const python = pythonLines.join('\n') + '\n'

const P = fragment => {
  const index = pythonLines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`Missing python line: ${fragment}`)
  return index + 1
}

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > MAX_LENGTH || nums.length % 2 !== 0) {
    throw new Error(`Use an array of even length from 2 to ${MAX_LENGTH}.`)
  }
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 1000)) throw new Error('Each value is an integer from 1 to 1000.')
  return nums
}

export function buildTrace(nums) {
  const n = nums.length
  const h = n / 2
  const frames = []
  const total = nums.reduce((sum, v) => sum + v, 0)
  let first = nums.slice(0, h).reduce((sum, v) => sum + v, 0)
  let count = 0
  const windowAt = s => Array.from({ length: h }, (_, t) => (s + t) % n)
  const base = { total, h, n, first, count }

  frames.push({ ...base, phase: 'start', pythonLine: P('h = n // 2'), activeLine: L('h is half'), shift: -1, window: [], leftIdx: -1, enterIdx: -1, message: `Half length ${h}; the whole array sums to ${total}.` })
  frames.push({ ...base, phase: 'start', pythonLine: P('first = sum'), activeLine: L('first is the sum'), shift: -1, window: windowAt(0), leftIdx: -1, enterIdx: -1, message: `The first half of the unrotated array sums to ${first}.` })
  frames.push({ ...base, phase: 'count', pythonLine: P('count = 0'), activeLine: L('count is 0'), shift: -1, window: [], leftIdx: -1, enterIdx: -1, message: 'No good rotation counted yet.' })

  for (let s = 0; s < n; s++) {
    if (s > 0) {
      const leftIdx = (s - 1 + n) % n
      const enterIdx = (s + h - 1) % n
      first = first - nums[leftIdx] + nums[enterIdx]
      frames.push({ ...base, first, phase: 'slide', pythonLine: P('first = first -'), activeLine: L('if s is above 0'), shift: s, window: windowAt(s), leftIdx, enterIdx, message: `Shift ${s}: drop ${nums[leftIdx]} at position ${leftIdx}, add ${nums[enterIdx]} at position ${enterIdx}; first half is ${first}.` })
    } else {
      frames.push({ ...base, first, phase: 'window', pythonLine: P('for s in range'), activeLine: L('for each shift s'), shift: 0, window: windowAt(0), leftIdx: -1, enterIdx: -1, message: `Shift 0 is the array as given; first half is ${first}.` })
    }
    const second = total - first
    const good = first > second
    if (good) count += 1
    frames.push({ ...base, first, count, phase: good ? 'good' : 'bad', pythonLine: P('if first > total'), activeLine: L('if first is greater'), shift: s, window: windowAt(s), leftIdx: -1, enterIdx: -1, verdict: good, second, message: `Shift ${s}: first half ${first} vs second half ${second}; ${good ? 'good, count it' : 'not good'}.` })
  }
  frames.push({ ...base, count, first, phase: 'done', pythonLine: P('return count'), activeLine: L('return count'), shift: -1, window: [], leftIdx: -1, enterIdx: -1, message: `Good rotations: ${count}.` })
  return { input: nums, result: count, frames }
}
