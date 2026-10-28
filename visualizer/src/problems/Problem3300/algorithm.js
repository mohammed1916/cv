export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums)) throw new Error('Use an object with a "nums" array.')
  const { nums } = input
  if (nums.length < 1 || nums.length > 30) throw new Error('nums holds 1 to 30 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 10000)) throw new Error('Each number is an integer from 1 to 10000.')
  return { nums }
}

function digitSum(value) {
  let total = 0
  for (let rest = value; rest > 0; rest = Math.floor(rest / 10)) total += rest % 10
  return total
}

export function buildTrace(input) {
  const { nums } = input
  const sums = nums.map(digitSum)
  const frames = [{ phase: 'start', activeLine: L('set best to nothing'), index: -1, value: null, digitSum: null, best: null, message: 'No number has been replaced yet.' }]
  let best = null
  nums.forEach((value, index) => {
    const total = sums[index]
    if (best === null || total < best) best = total
    frames.push({ phase: 'digit', activeLine: L('add up the digits'), index, value, digitSum: total, best, message: `${value} becomes ${total}. The smallest so far is ${best}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return best'), index: -1, value: null, digitSum: null, best, message: `The minimum element after replacement is ${best}.` })
  return { input, sums, result: best, frames }
}

export const code = `minimum element after replacing each number with its digit sum
  set best to nothing
  for each number in nums
    add up the digits of the number to get its digit sum
    if best is nothing or the digit sum is smaller than best then
      set best to the digit sum
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_element_after_digit_sum(nums):
    best = None
    for value in nums:
        total = 0
        rest = value
        while rest > 0:
            total += rest % 10
            rest //= 10
        if best is None or total < best:
            best = total
    return best
`
