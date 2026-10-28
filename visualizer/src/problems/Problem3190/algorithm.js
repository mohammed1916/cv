export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 40) throw new Error('Use an array of 1 to 40 numbers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 50)) throw new Error('Each number is an integer from 1 to 50.')
  return nums
}

export function buildTrace(nums) {
  const frames = [{ phase: 'start', activeLine: L('set total'), index: -1, total: 0, message: 'Each number is checked on its own, because a step of plus or minus one never affects another number.' }]
  let total = 0
  nums.forEach((x, i) => {
    const remainder = x % 3
    if (remainder !== 0) {
      total += 1
      frames.push({ phase: 'fix', activeLine: L('add 1 to total'), index: i, total, message: `${x} leaves remainder ${remainder}, so one step of plus or minus one fixes it.` })
    } else {
      frames.push({ phase: 'ok', activeLine: L('if the number leaves'), index: i, total, message: `${x} is already divisible by three.` })
    }
  })
  frames.push({ phase: 'done', activeLine: L('return total'), index: -1, total, message: `Minimum operations: ${total}.` })
  return { input: nums, result: total, frames }
}

export const code = `minimum operations to make every number divisible by three
  set total to 0
  for each number from left to right
    if the number leaves remainder 1 or 2 when divided by 3 then
      add 1 to total, since one step of plus or minus one fixes it
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_operations(nums):
    total = 0
    for x in nums:
        if x % 3 != 0:
            total += 1
    return total
`
