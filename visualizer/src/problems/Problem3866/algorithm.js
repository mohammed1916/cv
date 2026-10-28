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
  const frames = [{ phase: 'count', activeLine: L('count how many times'), index: -1, value: null, count: null, result: null, message: `Counted the occurrences of ${count.size} distinct values.` }]
  let result = -1
  for (let i = 0; i < nums.length; i++) {
    const v = nums[i]
    const even = v % 2 === 0
    const unique = count.get(v) === 1
    const hit = even && unique
    frames.push({ phase: hit ? 'found' : 'scan', activeLine: L('if v is even'), index: i, value: v, count: count.get(v), result: null,
      message: `${v} at index ${i} ${hit ? 'is even and appears once, so it is the answer' : even ? 'is even but appears more than once' : 'is odd'}.` })
    if (hit) { result = v; break }
  }
  frames.push({ phase: 'done', activeLine: L('return v'), index: -1, value: result, count: null, result, message: `Answer: ${result}.` })
  return { input: { nums }, result, frames }
}

export const code = `first unique even element (nums):
  set count to an empty table
  count how many times each value appears in nums
  for each value v in nums, in order
    if v is even and count[v] equals 1 then
      return v
  return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def first_unique_even(nums):
    count = {}
    for v in nums:
        count[v] = count.get(v, 0) + 1
    for v in nums:
        if v % 2 == 0 and count[v] == 1:
            return v
    return -1
`
