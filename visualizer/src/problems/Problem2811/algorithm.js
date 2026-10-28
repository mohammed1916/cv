export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || Array.isArray(obj) || !Array.isArray(obj.nums) || !Number.isInteger(obj.m)) throw new Error('Use an object with an array key nums and an integer key m.')
  const { nums, m } = obj
  if (nums.length < 1 || nums.length > 8) throw new Error('nums has 1 to 8 entries.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 10)) throw new Error('nums entries are integers from 1 to 10.')
  if (m < 1 || m > 30) throw new Error('m is an integer from 1 to 30.')
  return { nums, m }
}

export function buildTrace(input) {
  const { nums, m } = input
  const n = nums.length
  const frames = [{ phase: 'start', activeLine: L('if the array has at most two'), index: -1, found: null, message: `The array has ${n} value(s) and the threshold is ${m}.` }]
  let result
  if (n <= 2) {
    result = true
    frames.push({ phase: 'done', activeLine: L('if the array has at most two'), index: -1, found: true, message: 'Two values always split into two single values.' })
  } else {
    result = false
    for (let i = 0; i + 1 < n; i++) {
      const sum = nums[i] + nums[i + 1]
      const hit = sum >= m
      frames.push({ phase: 'pair', activeLine: L('for each adjacent pair'), index: i, found: hit ? true : null, sum, message: `Pair ${nums[i]} + ${nums[i + 1]} = ${sum}, ${hit ? 'at least' : 'below'} ${m}.` })
      if (hit) { result = true; break }
    }
    frames.push({ phase: 'done', activeLine: L(result ? 'if a plus b is at least m' : 'return no'), index: -1, found: result, message: result ? 'Splitting around that pair works.' : 'No adjacent pair reaches the threshold.' })
  }
  return { input, result, frames }
}

export const code = `can the array be split into single values and pieces of sum at least m
  if the array has at most two values then
    return yes
  for each adjacent pair (a, b)
    if a plus b is at least m then
      return yes
  return no`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def can_split_array(nums, m):
    if len(nums) <= 2:
        return True
    for i in range(len(nums) - 1):
        if nums[i] + nums[i + 1] >= m:
            return True
    return False
`
