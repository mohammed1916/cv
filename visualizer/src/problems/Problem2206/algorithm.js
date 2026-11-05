// LeetCode 2206: Divide Array Into Equal Pairs.
// The array splits into equal-value pairs exactly when every value occurs an even number of times.
// Count each value and stop as soon as one count is odd.

const MAX_LEN = 16
const MAX_VALUE = 9

export function parseInput(text) {
  let nums
  try { nums = JSON.parse(text) } catch { throw new Error('Use a JSON array of integers with even length, e.g. [3,2,3,2,2,2].') }
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > MAX_LEN || nums.length % 2 !== 0) throw new Error(`Use an even number of values, from 2 to ${MAX_LEN}.`)
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= MAX_VALUE)) throw new Error(`Each value is an integer from 1 to ${MAX_VALUE}.`)
  return { nums }
}

export const code = `FUNCTION divideArray(nums)
    count ← empty counts
    FOR each value x in nums
        count[x] ← count[x] + 1
    FOR each value x in count
        IF count[x] mod 2 = 1 THEN RETURN false
    RETURN true`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `from collections import Counter

def divide_array(nums):
    count = Counter(nums)
    for x in count:
        if count[x] % 2 == 1:
            return False
    return True
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
  { id: 'count', label: 'Count', description: 'Count how many times each value appears.' },
  { id: 'check', label: 'Check', description: 'Every count must be even, so the values can pair up.' },
  { id: 'done', label: 'Result', description: 'Can the array be split into equal pairs?' },
]

export function buildTrace({ nums }) {
  const count = new Map()
  const frames = []
  const push = (phase, index, activeLine, pythonLine, message, extra = {}) => frames.push({ phase, index, activeLine, pythonLine, message, nums, counts: new Map(count), ...extra })
  push('count', -1, L('count ← empty'), P('count = Counter'), `${nums.length} values to pair up.`)
  nums.forEach((x, i) => {
    count.set(x, (count.get(x) || 0) + 1)
    push('count', i, L('count[x] ← count[x] + 1'), P('count = Counter'), `Value ${x} seen ${count.get(x)} time(s).`, { value: x })
  })
  let result = true
  for (const [x, c] of count) {
    const odd = c % 2 === 1
    push('check', -1, L('IF count[x] mod 2'), P('if count[x] % 2'), `${x} appears ${c} time(s): ${odd ? 'odd, so one copy is left over.' : 'even, so it pairs up.'}`, { value: x, odd })
    if (odd) { result = false; break }
  }
  push('done', -1, L('RETURN'), P('return True'), result ? 'Every value has an even count, so the array divides into equal pairs.' : 'Some value has an odd count, so a pair is impossible.', { result })
  return { input: { nums }, result, frames }
}
