export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Use an array of 1 to 12 integers.')
  if (!nums.every(x => Number.isInteger(x) && x >= 1 && x <= 100)) throw new Error('Each value is an integer from 1 to 100.')
  return nums
}

export function buildTrace(nums) {
  const target = Math.max(...nums)
  const frames = []
  let total = 0
  frames.push({ pythonLine: PL('target = max'), phase: 'scan', activeLine: L('the largest'), at: -1, target, total, message: `The largest value is ${target}; every other value must climb to it.` })
  nums.forEach((x, i) => {
    const cost = target - x
    total += cost
    frames.push({ pythonLine: PL('total += target - x'), phase: 'raise', activeLine: L('add the gap'), at: i, target, total,
      message: cost === 0 ? `nums[${i}] already equals ${target}.` : `nums[${i}] = ${x} needs ${cost} moves; running total ${total}.` })
  })
  frames.push({ pythonLine: PL('return total'), phase: 'done', activeLine: L('return the total'), at: -1, target, total, message: `All values reach ${target} after ${total} moves.` })
  return { input: { nums }, result: total, frames }
}

export const code = `minimum moves so that every value becomes equal
  target is the largest value
  total is 0
  for each value in order
    add the gap between target and the value to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_moves(nums):
    target = max(nums)
    total = 0
    for x in nums:
        total += target - x
    return total
`
const PL = s => python.split('\n').findIndex(c => c.includes(s)) + 1
