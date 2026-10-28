export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12 || nums.some(v => !Number.isInteger(v) || v < 0 || v > 1000)) throw new Error('Use 1 to 12 integers from 0 to 1000.')
  return nums
}

const digitSum = v => String(v).split('').reduce((a, ch) => a + Number(ch), 0)

export function buildTrace(nums) {
  const frames = []
  let answer = -1
  for (let i = 0; i < nums.length; i++) {
    const s = digitSum(nums[i])
    const hit = s === i
    frames.push({ phase: 'check', activeLine: L('set s to the digit sum'), index: i, sum: s, hit, message: `Digit sum of ${nums[i]} is ${s}; the index is ${i}.${hit ? ' They match.' : ''}` })
    if (hit) { answer = i; break }
  }
  frames.push({ phase: 'done', activeLine: L(answer === -1 ? 'return -1' : 'then return i'), index: answer, sum: answer === -1 ? 0 : digitSum(nums[answer]), hit: answer !== -1, message: answer === -1 ? 'No index matches its digit sum.' : `Index ${answer} is the smallest match.` })
  return { input: nums, result: answer, frames }
}

export const code = `smallest index whose digit sum equals the index:
  for each index i from 0 to the last index
    set s to the digit sum of nums[i]
    if s equals i then return i
  return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def smallest_index_with_digit_sum(nums):
    for i, x in enumerate(nums):
        s = sum(int(ch) for ch in str(x))
        if s == i:
            return i
    return -1
`
