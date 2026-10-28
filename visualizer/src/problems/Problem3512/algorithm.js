export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 50) throw new Error('nums must be an array of 1 to 50 numbers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 1000)) throw new Error('Each number must be an integer from 1 to 1000.')
  if (!Number.isInteger(k) || k < 1 || k > 100) throw new Error('k must be an integer from 1 to 100.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  let total = 0
  for (const v of nums) total += v
  const frames = [{ phase: 'start', activeLine: L('set total to'), total, remainder: null, message: `The array sums to ${total}.` }]
  const remainder = total % k
  frames.push({ phase: 'remainder', activeLine: L('set remainder to'), total, remainder, message: `${total} leaves remainder ${remainder} when divided by ${k}.` })
  frames.push({ phase: 'done', activeLine: L('return remainder'), total, remainder, message: `Decrease the sum by ${remainder} to make it divisible by ${k}.` })
  return { input: { nums, k }, result: remainder, total, frames }
}

export const code = `minimum decrements of array elements to make the sum divisible by k
read nums and k from the input
set total to the sum of nums
set remainder to total modulo k
each decrement lowers total by 1, so the remainder is the number of decrements needed
return remainder`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_operations(nums, k):
    total = sum(nums)
    remainder = total % k
    return remainder
`
