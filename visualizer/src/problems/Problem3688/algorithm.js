export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums, such as {"nums":[1,2,4]}.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums must hold 1 to 12 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 100)) throw new Error('Each number is an integer from 1 to 100.')
  return { nums }
}

export const code = `bitwise OR of all even numbers in nums
  set result to zero
  for each number x in nums
    if x is even then
      set result to result OR x
  return result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ nums }) {
  let result = 0
  const frames = [{ phase: 'start', activeLine: L('set result to zero'), index: -1, result, message: 'Start with 0, the OR of no numbers.' }]
  nums.forEach((x, index) => {
    if (x % 2 === 0) {
      result |= x
      frames.push({ phase: 'take', activeLine: L('set result to result OR x'), index, result, message: `${x} is even, so OR it in: result is ${result}.` })
    } else {
      frames.push({ phase: 'skip', activeLine: L('if x is even'), index, result, message: `${x} is odd, so it is skipped.` })
    }
  })
  frames.push({ phase: 'done', activeLine: L('return result'), index: -1, result, message: result === 0 ? 'No even numbers, so the answer is 0.' : `Bitwise OR of the even numbers: ${result}.` })
  return { input: { nums }, result, frames }
}

export const python = `def bitwise_or_of_evens(nums):
    result = 0
    for x in nums:
        if x % 2 == 0:
            result |= x
    return result
`
