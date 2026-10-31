export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 24 || nums.some(v => !Number.isInteger(v) || v < 0 || v > 65535)) throw new Error('Enter a JSON array of 1-24 integers in [0, 65535] (visualization caps).')
  return [...nums]
}
export function buildTrace(nums) {
  const frames = []
  const prefix = []
  const push = (phase, activeLine, message, extra = {}) => frames.push({ phase, activeLine, message, prefix: [...prefix], index: -1, x: 0, ...extra })
  push('start', L('set x to 0'), 'Alice moves first and loses if erasing a number leaves XOR 0. If the board already has XOR 0, she wins immediately.', { pythonLine: 2 })
  let x = 0
  for (let i = 0; i < nums.length; i++) {
    x ^= nums[i]
    prefix.push(x)
    push('xor', L('set x to x XOR v'), `Fold in ${nums[i]}: running XOR = ${x} (binary ${x.toString(2)}).`, { index: i, x, pythonLine: 4 })
  }
  const even = nums.length % 2 === 0
  let result
  if (x === 0) {
    result = true
    push('decide', L('if x is 0'), 'Total XOR is 0 before Alice moves, so she wins immediately.', { x, pythonLine: 5 })
  } else if (even) {
    result = true
    push('decide', L('if x is 0'), `XOR is ${x} (nonzero) and n = ${nums.length} is even. If every erase made the XOR 0 for Alice, all numbers would equal the total, and an even count of equal numbers XORs to 0, a contradiction. So Alice always has a safe move; the game ends exactly when the board is empty after Bob's turn, and with even n Bob is the one forced to erase the last number.`, { x, pythonLine: 5 })
  } else {
    result = false
    push('decide', L('if x is 0'), `XOR is ${x} (nonzero) and n = ${nums.length} is odd. By symmetry Bob can always keep a safe move, and Alice is the one forced to take the last number, which leaves XOR 0.`, { x, pythonLine: 5 })
  }
  push('done', result ? L('return true') : L('return false'), result ? 'Alice wins.' : 'Alice loses.', { x, pythonLine: 5 })
  return { input: nums, result, frames }
}
export const code = `let n be the number of numbers in nums
set x to 0
for each number v in nums
  set x to x XOR v
if x is 0 or the count of numbers is even, return true
return false`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def chalkboard_xor_game(nums):
    x = 0
    for v in nums:
        x ^= v
    return x == 0 or len(nums) % 2 == 0
`
