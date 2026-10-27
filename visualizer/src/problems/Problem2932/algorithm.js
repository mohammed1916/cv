export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums, such as {"nums":[1,2,3,4,5]}.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums must hold 1 to 12 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 100)) throw new Error('Each number is an integer from 1 to 100.')
  return { nums }
}

export const code = `maximum XOR of a strong pair
  sort the numbers in ascending order
  set best to zero and left to zero
  for each right index r in the sorted list
    while twice the value at left is less than the value at r
      move left one step to the right
    for each index i from left to r
      set best to the larger of best and the XOR of the values at i and r
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ nums }) {
  const values = [...nums].sort((a, b) => a - b)
  const frames = [{ phase: 'sort', activeLine: L('sort the numbers'), values, right: -1, left: 0, best: 0, message: `Sorted: ${values.join(', ')}. In a sorted list, a strong pair is a value and a later value at most twice it.` }]
  let best = 0
  let left = 0
  frames.push({ phase: 'window', activeLine: L('set best to zero'), values, right: -1, left, best, message: 'Start with best at 0 and the window at the first value.' })
  for (let right = 0; right < values.length; right++) {
    while (values[right] > 2 * values[left]) left++
    frames.push({ phase: 'window', activeLine: L('while twice the value'), values, right, left, best, message: `Values ${values[left]} to ${values[right]} form strong pairs with ${values[right]}.` })
    for (let index = left; index <= right; index++) {
      const xor = values[index] ^ values[right]
      best = Math.max(best, xor)
      frames.push({ phase: 'pair', activeLine: L('set best to the larger'), values, right, left, pairing: index, best, message: `${values[index]} XOR ${values[right]} = ${xor}. Best is ${best}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), values, right: values.length - 1, left, best, message: `Maximum strong pair XOR: ${best}.` })
  return { input: { nums }, values, result: best, frames }
}

export const python = `def max_strong_pair_xor(nums):
    values = sorted(nums)
    best = 0
    left = 0
    for right in range(len(values)):
        while values[right] > 2 * values[left]:
            left += 1
        for index in range(left, right + 1):
            best = max(best, values[index] ^ values[right])
    return best
`
