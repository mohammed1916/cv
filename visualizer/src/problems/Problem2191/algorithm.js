// LeetCode 2191: Sort the Jumbled Numbers.
// Replace every digit d of a number with mapping[d] to get its mapped value. Sort the numbers by mapped value.
// Ties keep their original order, so the sort is stable.

const MAX_LEN = 8
const MAX_NUM = 99999

export function parseInput(text) {
  let spec
  try { spec = JSON.parse(text) } catch { throw new Error('Use JSON like {"mapping":[8,3,...],"nums":[991,338]}.') }
  if (!spec || !Array.isArray(spec.mapping) || !Array.isArray(spec.nums)) throw new Error('Give mapping and nums arrays.')
  if (spec.mapping.length !== 10 || !spec.mapping.every(d => Number.isInteger(d) && d >= 0 && d <= 9)) throw new Error('mapping has ten digits from 0 to 9.')
  if (spec.nums.length < 1 || spec.nums.length > MAX_LEN) throw new Error(`Use 1 to ${MAX_LEN} numbers.`)
  if (!spec.nums.every(v => Number.isInteger(v) && v >= 0 && v <= MAX_NUM)) throw new Error(`Each number is an integer from 0 to ${MAX_NUM}.`)
  return { mapping: spec.mapping, nums: spec.nums }
}

export const code = `FUNCTION sortJumbled(mapping, nums)
    FOR each index i, value x in nums
        mapped[i] ← digit-by-digit replacement of x using mapping
    order ← indices 0 to length(nums) - 1
    sort order by (mapped[i], i)
    result ← nums[order[0]], nums[order[1]], ...
    RETURN result`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def sort_jumbled(mapping, nums):
    def f(x):
        if x == 0:
            return mapping[0]
        y, k = 0, 1
        while x:
            x, v = divmod(x, 10)
            y = k * mapping[v] + y
            k *= 10
        return y
    arr = sorted((f(x), i) for i, x in enumerate(nums))
    return [nums[i] for _, i in arr]
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
  { id: 'map', label: 'Map digits', description: 'Replace each digit to get the mapped value of every number.' },
  { id: 'sort', label: 'Sort', description: 'Order by mapped value; ties keep the earlier number first.' },
  { id: 'done', label: 'Result', description: 'The numbers in their new order.' },
]

export function mapValue(x, mapping) {
  if (x === 0) return mapping[0]
  return Number(String(x).split('').map(d => mapping[Number(d)]).join(''))
}

export function buildTrace({ mapping, nums }) {
  const mapped = nums.map(x => mapValue(x, mapping))
  const frames = []
  const push = (phase, index, activeLine, pythonLine, message, extra = {}) => frames.push({ phase, index, activeLine, pythonLine, message, mapping, nums, mapped: mapped.slice(0, extra.upto ?? mapped.length), ...extra })
  push('map', -1, L('FOR each index'), P('def f(x)'), `Digit map: ${mapping.map((d, i) => `${i}→${d}`).join(', ')}.`, { upto: 0 })
  nums.forEach((x, i) => {
    push('map', i, L('mapped[i] ←'), P('y = k * mapping[v]'), `${x} becomes ${mapped[i]} (each digit replaced).`, { upto: i + 1 })
  })
  const order = nums.map((_, i) => i).sort((a, b) => mapped[a] - mapped[b] || a - b)
  push('sort', -1, L('sort order by'), P('sorted((f(x), i)'), `Sorted by mapped value, ties by original position: ${order.map(i => `${nums[i]} (${mapped[i]})`).join(', ')}.`, { order })
  const result = order.map(i => nums[i])
  push('done', -1, L('RETURN result'), P('return [nums[i]'), `Result: ${result.join(', ')}.`, { order, result })
  return { input: { mapping, nums }, result, frames }
}
