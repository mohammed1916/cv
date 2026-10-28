export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12 || nums.some(v => !Number.isInteger(v) || v < 0 || v > 1000)) throw new Error('Use 1 to 12 integers from 0 to 1000.')
  return nums
}

export function buildTrace(nums) {
  const replaced = []
  const frames = [{ phase: 'start', activeLine: L('for each value in nums'), index: -1, values: [], message: 'Replace each value by its parity: even becomes 0, odd becomes 1.' }]
  for (let i = 0; i < nums.length; i++) {
    replaced.push(nums[i] % 2 === 0 ? 0 : 1)
    frames.push({ phase: 'replace', activeLine: L('replace an even value'), index: i, values: [...replaced], message: `${nums[i]} is ${nums[i] % 2 === 0 ? 'even, so 0' : 'odd, so 1'}.` })
  }
  const sorted = [...replaced].sort((a, b) => a - b)
  frames.push({ phase: 'sort', activeLine: L('sort the replaced values'), index: -1, values: sorted, message: 'Sort ascending: all zeros first, then all ones.' })
  frames.push({ phase: 'done', activeLine: L('return the sorted values'), index: -1, values: sorted, message: `Result: [${sorted.join(', ')}].` })
  return { input: nums, result: sorted, frames }
}

export const code = `transform array by parity:
  for each value in nums
    replace an even value with 0 and an odd value with 1
  sort the replaced values in ascending order
  return the sorted values`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def transform_array_by_parity(nums):
    replaced = [0 if x % 2 == 0 else 1 for x in nums]
    replaced.sort()
    return replaced
`
