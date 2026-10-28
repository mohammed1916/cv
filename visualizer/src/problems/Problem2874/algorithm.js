export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || Array.isArray(obj) || !Array.isArray(obj.nums)) throw new Error('Use an object with an array key nums.')
  const { nums } = obj
  if (nums.length < 3 || nums.length > 12) throw new Error('nums has 3 to 12 entries.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 50)) throw new Error('nums entries are integers from 1 to 50.')
  return { nums }
}

export function buildTrace(input) {
  const { nums } = input
  const n = nums.length
  const after = Array(n + 1).fill(0)
  for (let k = n - 1; k >= 0; k--) after[k] = Math.max(nums[k], after[k + 1])
  let best = 0
  let before = nums[0]
  const frames = [{ phase: 'start', activeLine: L('set after to the largest value after each index'), index: -1, before, best, message: 'Precompute the largest value to the right of every index.' }]
  for (let j = 1; j < n - 1; j++) {
    const gap = before - nums[j]
    const value = gap * after[j + 1]
    if (value > best) best = value
    frames.push({ phase: 'middle', activeLine: L('for each middle index'), index: j, before, best, value, message: `Middle ${j}: (${before} - ${nums[j]}) times ${after[j + 1]} = ${value}. Best so far: ${best}.` })
    if (nums[j] > before) before = nums[j]
  }
  frames.push({ phase: 'done', activeLine: L('return best'), index: -1, before, best, message: `Maximum triplet value: ${best}.` })
  return { input, result: best, frames }
}

export const code = `maximum value of an ordered triplet
  set after to the largest value after each index
  set best to 0
  set before to nums[0]
  for each middle index j from 1 to n minus 2
    set gap to before minus nums[j]
    set value to gap times after[j + 1]
    if value is above best then
      set best to value
    if nums[j] is above before then
      set before to nums[j]
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_triplet_value(nums):
    n = len(nums)
    after = [0] * (n + 1)
    for k in range(n - 1, -1, -1):
        after[k] = max(nums[k], after[k + 1])
    best = 0
    before = nums[0]
    for j in range(1, n - 1):
        gap = before - nums[j]
        best = max(best, gap * after[j + 1])
        before = max(before, nums[j])
    return best
`
