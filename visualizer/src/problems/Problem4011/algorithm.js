export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums, a and b.')
  const { nums, a, b } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums is a list of 1 to 12 values.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 1000)) throw new Error('Each value is an integer from 1 to 1000.')
  if (!Number.isInteger(a) || a < 1 || a > 1000) throw new Error('a is an integer from 1 to 1000.')
  if (!Number.isInteger(b) || b < 1 || b > 1000) throw new Error('b is an integer from 1 to 1000.')
  return { nums, a, b }
}

const lineOf = (list, text) => {
  const i = list.findIndex(c => c.text.includes(text))
  if (i < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return i + 1
}

export function buildTrace({ nums, a, b }) {
  const frames = []
  const L = t => lineOf(code, t)
  const P = t => lineOf(PY, t)
  let count = 0
  frames.push({ phase: 'start', activeLine: L('count = 0'), pythonLine: P('count = 0'), left: -1, right: -1, evens: 0, odds: 0, ok: null, count, message: `Ratio test: even/odd must be at most ${a}/${b}.` })
  for (let left = 0; left < nums.length; left++) {
    let evens = 0
    let odds = 0
    frames.push({ phase: 'left', activeLine: L('for each left index'), pythonLine: P('for left in range'), left, right: left - 1, evens, odds, ok: null, count, message: `Start subarrays at index ${left}.` })
    for (let right = left; right < nums.length; right++) {
      if (nums[right] % 2 === 0) evens++
      else odds++
      const ok = odds >= 1 && evens * b <= a * odds
      if (ok) count++
      const why = odds < 1 ? 'no odd value yet' : ok ? `${evens}/${odds} is within ${a}/${b}` : `${evens}/${odds} is above ${a}/${b}`
      frames.push({ phase: ok ? 'count' : 'skip', activeLine: L('if odds is at least 1'), pythonLine: P('if odds >= 1'), left, right, evens, odds, ok, count, message: `Subarray ${left}..${right}: ${why}.${ok ? ` Count is now ${count}.` : ''}` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return count'), pythonLine: P('return count'), left: -1, right: -1, evens: 0, odds: 0, ok: null, count, result: count, message: `${count} subarrays qualify.` })
  return { input: { nums, a, b }, result: count, frames }
}

export const code = `count subarrays with an odd value and even over odd count at most a over b
count = 0
for each left index
  evens = 0 and odds = 0
  for each right index from left
    add nums[right] to evens or odds
    if odds is at least 1 and evens times b is at most a times odds then add one to count
return count`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def count_even_odd_ratio(nums, a, b):
    count = 0
    for left in range(len(nums)):
        evens = 0
        odds = 0
        for right in range(left, len(nums)):
            if nums[right] % 2 == 0:
                evens += 1
            else:
                odds += 1
            if odds >= 1 and evens * b <= a * odds:
                count += 1
    return count
`
const PY = python.split('\n').map((text, index) => ({ line: index + 1, text }))
