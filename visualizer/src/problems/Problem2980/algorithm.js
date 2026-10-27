export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with one key, nums.')
  const { nums } = data
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 20) throw new Error('nums must be an array of 2 to 20 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 100)) throw new Error('Each value is an integer from 1 to 100.')
  return { nums }
}

export function buildTrace({ nums }) {
  const frames = []
  let evens = 0
  frames.push({ phase: 'start', activeLine: L('set even count to 0'), index: -1, evens, message: 'Start with no even numbers counted.' })
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] % 2 === 0) {
      evens++
      frames.push({ phase: 'even', activeLine: L('add 1 to even count'), index: i, evens, message: `${nums[i]} is even. Even count is now ${evens}.` })
      if (evens >= 2) {
        frames.push({ phase: 'found', activeLine: L('return true'), index: i, evens, message: 'Two even numbers give an OR with a trailing zero.' })
        return { input: { nums }, result: true, frames }
      }
    } else {
      frames.push({ phase: 'odd', activeLine: L('if v is even'), index: i, evens, message: `${nums[i]} is odd, so it is skipped.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return false'), index: -1, evens, message: 'Fewer than two even numbers, so no trailing zero is possible.' })
  return { input: { nums }, result: false, frames }
}

export const code = `check for trailing zeros in the OR of two or more numbers
  set even count to 0
  for each number v in nums do
    if v is even then
      add 1 to even count
    if even count is at least 2 then
      return true
  return false`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error('missing code line: ' + s); return i + 1 }

export const python = `def has_trailing_zeros(nums):
    even_count = 0
    for v in nums:
        if v % 2 == 0:
            even_count += 1
        if even_count >= 2:
            return True
    return False
`
