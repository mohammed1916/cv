export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object with nums.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 20) throw new Error('nums must be an array of 1 to 20 numbers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 10000)) throw new Error('Each number must be an integer from 1 to 10000.')
  return { nums }
}

export function buildTrace({ nums }) {
  let total = 0
  const qualifies = []
  const frames = [{ phase: 'start', activeLine: L('set total to 0'), index: -1, total, qualifies: [], message: 'Check each number for exactly four divisors.' }]
  nums.forEach((value, index) => {
    const divisors = []
    for (let d = 1; d * d <= value; d++) {
      if (value % d === 0) {
        divisors.push(d)
        if (d * d !== value) divisors.push(value / d)
      }
    }
    const ok = divisors.length === 4
    if (ok) {
      total += divisors.reduce((acc, d) => acc + d, 0)
      qualifies.push(index)
    }
    frames.push({ phase: 'number', activeLine: L('if exactly four'), index, total, qualifies: qualifies.slice(), message: `${value} has ${divisors.length} divisors${ok ? ', so its divisor sum is added.' : ', so it is skipped.'}` })
  })
  frames.push({ phase: 'done', activeLine: L('return total'), index: -1, total, qualifies: qualifies.slice(), message: `The total is ${total}.` })
  return { input: { nums }, result: total, qualifies, frames }
}

export const code = `sum the divisor sums of the numbers that have exactly four divisors
read the list of numbers from the input
set total to 0
for each number in the list do
  find every divisor by testing candidates up to the square root
  if exactly four divisors were found then add their sum to total
return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def sum_four_divisors(nums):
    total = 0
    for value in nums:
        divisors = []
        d = 1
        while d * d <= value:
            if value % d == 0:
                divisors.append(d)
                if d * d != value:
                    divisors.append(value // d)
            d += 1
        if len(divisors) == 4:
            total += sum(divisors)
    return total
`
