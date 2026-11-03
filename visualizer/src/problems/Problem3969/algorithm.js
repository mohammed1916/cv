export const code = `set count to zero
for each start index l
  set sum to zero
  for each end index r from l
    add value at r to sum
    if the first digit and the last digit of sum both equal x, add one to count
return count`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def count_matching_subarrays(nums, x):
    count = 0
    for l in range(len(nums)):
        total = 0
        for r in range(l, len(nums)):
            total += nums[r]
            digits = str(total)
            if digits[0] == str(x) and digits[-1] == str(x):
                count += 1
    return count
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and x.')
  const { nums, x } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums holds 1 to 12 integers.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 1000)) throw new Error('Each value is an integer from 1 to 1000.')
  if (!Number.isInteger(x) || x < 1 || x > 9) throw new Error('x is a digit from 1 to 9.')
  return { nums, x }
}

export function buildTrace({ nums, x }) {
  const frames = []
  let count = 0
  const digitsOf = s => String(s)
  frames.push({ phase: 'start', activeLine: L('set count to zero'), pythonLine: P('count = 0'), l: -1, r: -1, sum: null, first: null, last: null, hit: false, count, message: `Count subarrays whose sum starts and ends with digit ${x}.` })
  for (let l = 0; l < nums.length; l++) {
    frames.push({ phase: 'start-index', activeLine: L('for each start index l'), pythonLine: P('for l in range'), l, r: l - 1, sum: 0, first: null, last: null, hit: false, count, message: `Start at index ${l} with sum 0.` })
    let sum = 0
    for (let r = l; r < nums.length; r++) {
      sum += nums[r]
      const digits = digitsOf(sum)
      const first = digits[0]
      const last = digits[digits.length - 1]
      const hit = first === String(x) && last === String(x)
      if (hit) count++
      frames.push({ phase: hit ? 'hit' : 'extend', activeLine: L('add value at r to sum'), pythonLine: P('total += nums[r]'), l, r, sum, first, last, hit, count, message: `Subarray ${l} to ${r} sums to ${sum}: first digit ${first}, last digit ${last}${hit ? ', so it counts' : ', so it does not count'}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return count'), pythonLine: P('return count'), l: -1, r: -1, sum: null, first: null, last: null, hit: false, count, message: `${count} subarray${count === 1 ? '' : 's'} match.` })
  return { input: { nums, x }, result: count, frames }
}
