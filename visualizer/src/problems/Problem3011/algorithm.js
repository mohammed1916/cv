const bitCount = v => { let c = 0; for (let x = v; x > 0; x &= x - 1) c++; return c }

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with one key, nums.')
  const { nums } = data
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 20) throw new Error('nums must be an array of 1 to 20 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 255)) throw new Error('Each value is an integer from 1 to 255.')
  return { nums }
}

export function buildTrace({ nums }) {
  const n = nums.length
  const frames = []
  let previousMax = 0
  let start = 0
  frames.push({ phase: 'start', activeLine: L('set previous maximum to 0'), start: 0, end: -1, low: null, high: null, previousMax, message: 'Scan the array in runs of equal set bit counts.' })
  while (start < n) {
    const bits = bitCount(nums[start])
    let end = start
    while (end + 1 < n && bitCount(nums[end + 1]) === bits) end++
    const group = nums.slice(start, end + 1)
    const low = Math.min(...group)
    const high = Math.max(...group)
    frames.push({ phase: 'group', activeLine: L('set low to the minimum'), start, end, low, high, previousMax, message: `Run ${start}-${end} has ${bits} set bits, minimum ${low}, maximum ${high}.` })
    if (low < previousMax) {
      frames.push({ phase: 'fail', activeLine: L('return false'), start, end, low, high, previousMax, message: `Minimum ${low} is below the previous run maximum ${previousMax}, so the runs cannot be ordered.` })
      return { input: { nums }, result: false, frames }
    }
    previousMax = high
    start = end + 1
  }
  frames.push({ phase: 'done', activeLine: L('return true'), start: n, end: n - 1, low: null, high: null, previousMax, message: 'Every run starts above the previous run, so the array can be sorted.' })
  return { input: { nums }, result: true, frames }
}

export const code = `can the array be sorted by swapping neighbours with equal set bit counts
  set previous maximum to 0
  set start to 0
  while start is less than the length do
    set end to start
    extend end while the next value has the same set bit count as start
    set low to the minimum of nums from start to end
    set high to the maximum of nums from start to end
    if low is less than previous maximum then
      return false
    set previous maximum to high
    set start to end + 1
  return true`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error('missing code line: ' + s); return i + 1 }

export const python = `def can_sort_by_bits(nums):
    def bit_count(v):
        return bin(v).count('1')

    n = len(nums)
    previous_max = 0
    start = 0
    while start < n:
        bits = bit_count(nums[start])
        end = start
        while end + 1 < n and bit_count(nums[end + 1]) == bits:
            end += 1
        group = nums[start:end + 1]
        if min(group) < previous_max:
            return False
        previous_max = max(group)
        start = end + 1
    return True
`
