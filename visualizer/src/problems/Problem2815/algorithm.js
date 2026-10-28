export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Use an array of 1 to 12 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 9999)) throw new Error('Each value is an integer from 1 to 9999.')
  return nums
}

const largestDigit = v => Math.max(...String(v).split('').map(Number))

export function buildTrace(nums) {
  const frames = [{ phase: 'start', activeLine: L('set answer to -1'), active: -1, roles: {}, state: { answer: -1 }, message: 'Pair two numbers only when their largest digits match. Track the largest number seen for each largest digit.' }]
  let answer = -1
  const largest = new Map()
  nums.forEach((num, i) => {
    const d = largestDigit(num)
    const prev = largest.get(d)
    let candidate = null
    if (prev !== undefined) {
      candidate = prev + num
      answer = Math.max(answer, candidate)
      largest.set(d, Math.max(prev, num))
    } else {
      largest.set(d, num)
    }
    frames.push({ phase: 'scan', activeLine: L(candidate === null ? 'otherwise set largest' : 'if largest has d'), active: i, roles: { [i]: candidate === null ? 'first' : 'paired' }, state: { number: num, digit: d, pairSum: candidate ?? 'none', answer }, message: candidate === null ? `${num} has largest digit ${d}, the first with that digit.` : `${num} has largest digit ${d}. Pair with ${prev} gives ${candidate}. Answer ${answer}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return answer'), active: -1, roles: {}, state: { answer }, message: `Return ${answer}.` })
  return { input: nums, result: answer, items: nums, frames }
}

export const code = `largest pair sum with equal largest digits
  set answer to -1
  set largest to an empty map from digit to number
  for each number in nums
    set d to the largest digit of number
    if largest has d then
      set answer to the larger of answer and largest[d] plus number
      set largest[d] to the larger of largest[d] and number
    otherwise set largest[d] to number
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_pair_sum(nums):
    answer = -1
    largest = {}
    for num in nums:
        d = max(int(ch) for ch in str(num))
        if d in largest:
            answer = max(answer, largest[d] + num)
            largest[d] = max(largest[d], num)
        else:
            largest[d] = num
    return answer
`
