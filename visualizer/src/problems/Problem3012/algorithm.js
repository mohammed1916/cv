const MAX_LENGTH = 8
const MAX_VALUE = 30

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.nums)) throw new Error('Use an object like {"nums":[1,4,3,1]}.')
  if (data.nums.length < 1 || data.nums.length > MAX_LENGTH) throw new Error(`Use 1 to ${MAX_LENGTH} values.`)
  if (data.nums.some(v => !Number.isInteger(v) || v < 1 || v > MAX_VALUE)) throw new Error(`Values are integers from 1 to ${MAX_VALUE}.`)
  return { nums: data.nums }
}

export function buildTrace({ nums }) {
  const smallest = Math.min(...nums)
  const count = nums.filter(v => v === smallest).length
  const frames = [{ phase: 'min', activeLine: L('set smallest to the minimum'), index: -1, smallest, message: `The smallest value is ${smallest}, found ${count} time(s).` }]
  for (let i = 0; i < nums.length; i++) {
    const remainder = nums[i] % smallest
    if (remainder !== 0) {
      frames.push({ phase: 'scan', activeLine: L('return 1'), index: i, smallest, message: `${nums[i]} mod ${smallest} = ${remainder}, a smaller value, so the length can reach 1.` })
      frames.push({ phase: 'done', activeLine: L('return 1'), index: i, smallest, message: 'Minimum length: 1.' })
      return { input: { nums }, result: 1, frames }
    }
    frames.push({ phase: 'scan', activeLine: L('if x modulo smallest is not 0'), index: i, smallest, message: `${nums[i]} mod ${smallest} = 0.` })
  }
  const result = Math.floor((count + 1) / 2)
  frames.push({ phase: 'done', activeLine: L('return (count + 1)'), index: -1, smallest, message: `Every value is a multiple of ${smallest}, so the minimum length is ${result}.` })
  return { input: { nums }, result, frames }
}

export const code = `minimum length after modulo operations
  set smallest to the minimum value in nums
  set count to the number of elements equal to smallest
  for each value x in nums
    if x modulo smallest is not 0 then return 1
  return (count + 1) divided by 2, rounded down`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_length(nums):
    smallest = min(nums)
    if any(x % smallest for x in nums):
        return 1
    count = nums.count(smallest)
    return (count + 1) // 2
`
