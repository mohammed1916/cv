const MAX_LENGTH = 12
const MAX_VALUE = 6

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_LENGTH) throw new Error(`Use an array of 1 to ${MAX_LENGTH} integers.`)
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > MAX_VALUE)) throw new Error(`Values are integers from 1 to ${MAX_VALUE}.`)
  return nums
}

export const code = `length of the longest strictly increasing or strictly decreasing subarray
  set best to 1, up to 1, and down to 1
  for each index i from 1 to n minus 1
    if nums[i] is greater than nums[i-1] then
      set up to up plus 1 and down to 1
    otherwise if nums[i] is less than nums[i-1] then
      set down to down plus 1 and up to 1
    otherwise
      set up and down to 1
    set best to the largest of best, up, and down
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace(nums) {
  let best = 1
  let up = 1
  let down = 1
  const frames = [{ phase: 'start', index: 0, up, down, best, activeLine: L('set best to 1'), message: 'A single number is a run of length 1 in both directions.' }]
  for (let i = 1; i < nums.length; i++) {
    let line
    let message
    if (nums[i] > nums[i - 1]) {
      up += 1
      down = 1
      line = L('set up to up plus 1')
      message = `${nums[i]} rises from ${nums[i - 1]}: increasing run ${up}.`
    } else if (nums[i] < nums[i - 1]) {
      down += 1
      up = 1
      line = L('set down to down plus 1')
      message = `${nums[i]} falls from ${nums[i - 1]}: decreasing run ${down}.`
    } else {
      up = 1
      down = 1
      line = L('set up and down to 1')
      message = `${nums[i]} equals ${nums[i - 1]}, so both runs restart.`
    }
    best = Math.max(best, up, down)
    frames.push({ phase: 'step', index: i, up, down, best, activeLine: line, message })
  }
  frames.push({ phase: 'done', index: nums.length - 1, up, down, best, activeLine: L('return best'), message: `Longest run: ${best}.` })
  return { input: nums, result: best, frames }
}

export const python = `def longest_monotone_subarray(nums):
    best = 1
    up = 1
    down = 1
    for i in range(1, len(nums)):
        if nums[i] > nums[i - 1]:
            up, down = up + 1, 1
        elif nums[i] < nums[i - 1]:
            up, down = 1, down + 1
        else:
            up, down = 1, 1
        best = max(best, up, down)
    return best
`
