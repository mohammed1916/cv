export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums)) throw new Error('Use an object with a nums array.')
  const { nums } = obj
  if (nums.length < 1 || nums.length > 12) throw new Error('Use 1 to 12 numbers for the visualization.')
  if (nums.some(v => !Number.isInteger(v) || v < 10 || v > 100000)) throw new Error('Each number must be an integer from 10 to 100000.')
  return { nums }
}

const digitRange = v => {
  const digits = String(v).split('').map(Number)
  return Math.max(...digits) - Math.min(...digits)
}

export function buildTrace(input) {
  const { nums } = input
  const frames = []
  let best = -1
  let total = 0
  frames.push({ phase: 'start', activeLine: L('set best to -1'), index: -1, range: null, best, total, message: 'Start with no best range and a total of 0.' })
  nums.forEach((x, index) => {
    const range = digitRange(x)
    frames.push({ phase: 'range', activeLine: L('compute the digit range'), index, range, best, total, message: `${x} has digit range ${range}.` })
    if (range > best) {
      best = range
      total = x
      frames.push({ phase: 'reset', activeLine: L('if range is greater than best'), index, range, best, total, message: `${range} is the new maximum, so the total restarts at ${x}.` })
    } else if (range === best) {
      total += x
      frames.push({ phase: 'add', activeLine: L('if range equals best'), index, range, best, total, message: `${x} ties the maximum range ${best}, so it joins the total.` })
    } else {
      frames.push({ phase: 'skip', activeLine: L('for each number x'), index, range, best, total, message: `${x} has a smaller range than ${best}, so it is skipped.` })
    }
  })
  frames.push({ phase: 'done', activeLine: L('return total'), index: -1, range: null, best, total, message: `Sum of the numbers with the maximum digit range: ${total}.` })
  return { input, result: total, frames }
}

export const code = `sum of integers with maximum digit range of nums
  set best to -1 and total to 0
  for each number x in nums do
    compute the digit range of x as its largest digit minus its smallest digit
    if range is greater than best then
      set best to range and set total to x
    otherwise if range equals best then
      add x to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def sum_integers_with_maximum_digit_range(nums):
    best = -1
    total = 0
    for x in nums:
        digits = [int(d) for d in str(x)]
        r = max(digits) - min(digits)
        if r > best:
            best = r
            total = x
        elif r == best:
            total += x
    return total
`
