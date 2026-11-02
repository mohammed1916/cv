export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12 || !nums.every(v => Number.isInteger(v) && v >= 1 && v <= 200)) throw new Error('nums has 1 to 12 integers from 1 to 200.')
  return { nums }
}

const isBinaryPalindrome = v => {
  const bits = v.toString(2)
  return bits === [...bits].reverse().join('')
}

export function buildTrace({ nums }) {
  const frames = []
  let total = 0
  frames.push({ pythonLine: 6, phase: 'start', activeLine: L('total = 0'), at: -1, total, message: 'Start with zero operations.' })
  for (let i = 0; i < nums.length; i++) {
    const x = nums[i]
    let d = 0
    frames.push({ pythonLine: 7, phase: 'pick', activeLine: L('for each element'), at: i, d, total, message: `Find the cost for ${x}.` })
    for (;;) {
      const low = x - d
      const lowOk = low >= 1 && isBinaryPalindrome(low)
      const highOk = isBinaryPalindrome(x + d)
      const ok = lowOk || highOk
      frames.push({ pythonLine: 9, phase: 'check', activeLine: L('if a palindrome'), at: i, d, total, ok, message: ok ? `${lowOk ? `${low} (${low.toString(2)})` : `${x + d} (${(x + d).toString(2)})`} is a binary palindrome at distance ${d}.` : `Neither ${low} nor ${x + d} is a binary palindrome.` })
      if (ok) break
      d += 1
      frames.push({ pythonLine: 10, phase: 'step', activeLine: L('d += 1'), at: i, d, total, ok: false, message: `Widen the search to distance ${d}.` })
    }
    total += d
    frames.push({ pythonLine: 11, phase: 'add', activeLine: L('total = total + d'), at: i, d, total, ok: true, message: `Add ${d}; total is ${total}.` })
  }
  frames.push({ pythonLine: 12, phase: 'done', activeLine: L('return total'), at: -1, total, ok: true, message: `Minimum operations: ${total}.` })
  return { input: { nums }, result: total, frames }
}

export const code = `minimum total moves so each value becomes a binary palindrome
  total = 0
  for each value x of nums
    d = 0
    while neither x minus d (if positive) nor x plus d is a binary palindrome
      d = d + 1
    total = total + d
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def is_binary_palindrome(v):
    bits = bin(v)[2:]
    return bits == bits[::-1]

def min_operations_binary_palindrome(nums):
    total = 0
    for x in nums:
        d = 0
        while not ((x - d >= 1 and is_binary_palindrome(x - d)) or is_binary_palindrome(x + d)):
            d += 1
        total += d
    return total
`
