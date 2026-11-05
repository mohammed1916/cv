export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with a count of zero and no number under inspection.' },
  { id: 'read', label: 'Read number', description: 'Take the next number and prepare to count its decimal digits.' },
  { id: 'digit', label: 'Strip digit', description: 'Divide by ten to drop the last digit; each strip adds one to the digit count.' },
  { id: 'even', label: 'Even digit count', description: 'An even number of digits contributes to the answer.' },
  { id: 'odd', label: 'Odd digit count', description: 'An odd number of digits does not contribute.' },
  { id: 'done', label: 'Complete', description: 'Return how many numbers had an even digit count.' },
]

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 500) throw new Error('Use a JSON array of 1 to 500 positive integers, such as [12, 345, 2, 6].')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 100000)) throw new Error('Every value must be an integer from 1 to 100000.')
  return nums
}

export function buildTrace(nums) {
  const digitCounts = []
  let count = 0
  const snap = (index, value, digits, verdict) => ({ index, value, digits, verdict, count, digitCounts: [...digitCounts] })
  const frames = [{ phase: 'start', activeLine: L('let count = 0'), pythonLine: P('count = 0'), snapshot: snap(null, null, null, null), message: `Count the values with an even number of decimal digits across ${nums.length} numbers.` }]
  nums.forEach((value, index) => {
    frames.push({ phase: 'read', activeLine: L('for (const value'), pythonLine: P('for value in nums'), snapshot: snap(index, value, 0, null), message: `Number ${value} is next.` })
    let x = value
    let digits = 0
    while (x > 0) {
      x = Math.floor(x / 10)
      digits++
      frames.push({ phase: 'digit', activeLine: L('x = Math.floor'), pythonLine: P('x //= 10'), snapshot: snap(index, value, digits, null), message: `Strip a digit from ${value}: ${digits} digit(s) counted so far${x > 0 ? `, ${x} remains` : ''}.` })
    }
    digitCounts.push(digits)
    if (digits % 2 === 0) {
      count++
      frames.push({ phase: 'even', activeLine: L('if (digits % 2'), pythonLine: P('if digits % 2 == 0'), snapshot: snap(index, value, digits, 'even'), message: `${value} has ${digits} digits, an even number, so the count becomes ${count}.` })
    } else {
      frames.push({ phase: 'odd', activeLine: L('if (digits % 2'), pythonLine: P('if digits % 2 == 0'), snapshot: snap(index, value, digits, 'odd'), message: `${value} has ${digits} digit(s), an odd number, so the count is unchanged.` })
    }
  })
  frames.push({ phase: 'done', activeLine: L('return count'), pythonLine: P('return count'), snapshot: snap(null, null, null, null), message: `Return ${count}.` })
  return { input: nums, result: count, frames }
}

export const code = `function countEvenDigitNumbers(nums) {
  let count = 0
  for (const value of nums) {
    let digits = 0
    let x = value
    while (x > 0) {
      x = Math.floor(x / 10)
      digits++
    }
    if (digits % 2 === 0) count++
  }
  return count
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_even_digit_numbers(nums):
    count = 0
    for value in nums:
        digits = 0
        x = value
        while x > 0:
            x //= 10
            digits += 1
        if digits % 2 == 0:
            count += 1
    return count
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
