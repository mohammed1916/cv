export function parseInput(text) {
  const input = JSON.parse(text)
  const nums = input?.nums
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Give nums as an array of 1 to 12 entries.')
  if (nums.some(v => !Number.isInteger(v) || v < 0 || v > 30)) throw new Error('Each value in nums is an integer from 0 to 30.')
  if (!Number.isInteger(input.k) || input.k < 0 || input.k > 10) throw new Error('k is an integer from 0 to 10.')
  return { nums, k: input.k }
}

export function buildTrace({ nums, k }) {
  const sorted = [...nums].sort((a, b) => a - b)
  const n = sorted.length
  const frames = [{ phase: 'start', activeLine: L('set sorted to'), sorted, left: 0, right: -1, best: 0, message: `Sort the values. Each value can move by ${k} either way, so a group works when its spread is at most ${2 * k}.` }]
  let left = 0, best = 0
  for (let right = 0; right < n; right++) {
    while (sorted[right] - sorted[left] > 2 * k) {
      left++
      frames.push({ phase: 'shrink', activeLine: L('move left one step'), sorted, left, right, best, message: `Spread from ${sorted[left]} to ${sorted[right]} is still too wide, so move left to ${left}.` })
    }
    best = Math.max(best, right - left + 1)
    frames.push({ phase: 'record', activeLine: L('set best to the larger'), sorted, left, right, best, message: `Window ${left} to ${right} holds ${right - left + 1} values within spread ${2 * k}. Best ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), sorted, left, right: n - 1, best, message: `The maximum beauty is ${best}.` })
  return { input: { nums, k }, result: best, sorted, frames }
}

export const code = `maximum beauty (nums, k)
  set sorted to a sorted copy of nums
  set left to zero and best to zero
  for each right index in sorted
    while the spread from left to right is above two k
      move left one step to the right
    set best to the larger of best and the window size
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximum_beauty(nums, k):
    values = sorted(nums)
    best = 0
    left = 0
    for right in range(len(values)):
        while values[right] - values[left] > 2 * k:
            left += 1
        best = max(best, right - left + 1)
    return best
`
