export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums)) throw new Error('Use a JSON object with a "nums" array.')
  const { nums } = obj
  if (nums.length < 1 || nums.length > 30) throw new Error('nums must have 1 to 30 entries for this visualization.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 100)) throw new Error('Each value must be an integer from 1 to 100.')
  return { nums }
}

export function buildTrace({ nums }) {
  const count = new Map()
  for (const v of nums) count.set(v, (count.get(v) ?? 0) + 1)
  const byCount = new Map()
  for (const c of count.values()) byCount.set(c, (byCount.get(c) ?? 0) + 1)
  const frames = [{ phase: 'count', activeLine: L('count how many times'), index: -1, value: null, freq: null, result: null, message: `Counted ${count.size} distinct values and how many share each count.` }]
  let result = -1
  for (let i = 0; i < nums.length; i++) {
    const v = nums[i]
    const unique = byCount.get(count.get(v)) === 1
    frames.push({ phase: unique ? 'found' : 'scan', activeLine: L('if the number of values with that count'), index: i, value: v, freq: count.get(v), result: null,
      message: `${v} appears ${count.get(v)} time(s); ${unique ? 'no other value shares that count' : 'another value shares that count'}.` })
    if (unique) { result = v; break }
  }
  frames.push({ phase: 'done', activeLine: L('return -1'), index: -1, value: result, freq: null, result, message: `Answer: ${result}.` })
  return { input: { nums }, result, frames }
}

export const code = `first element with unique frequency (nums):
  set count to an empty table
  count how many times each value appears in nums
  set byCount to an empty table
  count how many distinct values share each count in count
  for each value v in nums, in order
    if the number of values with that count is exactly 1 then
      return v
  return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def first_unique_frequency(nums):
    count = {}
    for v in nums:
        count[v] = count.get(v, 0) + 1
    by_count = {}
    for c in count.values():
        by_count[c] = by_count.get(c, 0) + 1
    for v in nums:
        if by_count[count[v]] == 1:
            return v
    return -1
`
