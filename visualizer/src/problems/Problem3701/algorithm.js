export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 100) throw new Error('Use an array of 1 to 100 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 100)) throw new Error('Each element is an integer from 1 to 100.')
  return nums
}

export function buildTrace(nums) {
  let total = 0
  const frames = [{ phase: 'start', activeLine: L('set total to 0'), index: -1, total, message: 'Start with a total of 0.' }]
  nums.forEach((value, i) => {
    const even = i % 2 === 0
    total = even ? total + value : total - value
    frames.push({
      phase: 'step', activeLine: L('if index i is even'), index: i, total,
      message: `Index ${i} is ${even ? 'even, so add' : 'odd, so subtract'} ${value}. Total: ${total}.`,
    })
  })
  frames.push({ phase: 'done', activeLine: L('return total'), index: -1, total, message: `Alternating sum: ${total}.` })
  return { input: nums, result: total, frames }
}

export const code = `alternating sum of an array nums
  set total to 0
  for each index i from 0 to the last index
    if index i is even then
      add nums[i] to total
    otherwise
      subtract nums[i] from total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def compute_alternating_sum(nums):
    total = 0
    for i, value in enumerate(nums):
        if i % 2 == 0:
            total += value
        else:
            total -= value
    return total
`
