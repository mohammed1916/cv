export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with an nums array.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 3 || nums.length > 12) throw new Error('nums must have 3 to 12 entries.')
  if (nums.some(v => !Number.isInteger(v) || v < 0 || v > 1000)) throw new Error('Each value must be an integer from 0 to 1000.')
  const n = nums.length
  const hasPeak = [...Array(n).keys()].some(i => i > 0 && i < n - 1 && nums.slice(0, i).some(v => v < nums[i]) && nums.slice(i + 1).some(v => v < nums[i]))
  if (!hasPeak) throw new Error('nums must contain a peak with a smaller value on each side.')
  return { nums }
}

export function buildTrace(input) {
  const { nums } = input
  const n = nums.length
  const up = Array(n).fill(null)
  const down = Array(n).fill(null)
  const frames = [{ phase: 'start', pythonLine: 2, activeLine: L('const n = nums.length'), index: -1, up: [...up], down: [...down], best: null, message: 'Measure, for every index, the increasing run ending there and the decreasing run starting there.' }]
  for (let i = 0; i < n; i++) {
    up[i] = 1
    for (let j = 0; j < i; j++) if (nums[j] < nums[i]) up[i] = Math.max(up[i], up[j] + 1)
    frames.push({ phase: 'up', pythonLine: 7, activeLine: L('up[i] = Math.max'), index: i, up: [...up], down: [...down], best: null, message: `Longest increasing run ending at index ${i} is ${up[i]}.` })
  }
  for (let i = n - 1; i >= 0; i--) {
    down[i] = 1
    for (let j = i + 1; j < n; j++) if (nums[j] < nums[i]) down[i] = Math.max(down[i], down[j] + 1)
    frames.push({ phase: 'down', pythonLine: 12, activeLine: L('down[i] = Math.max'), index: i, up: [...up], down: [...down], best: null, message: `Longest decreasing run starting at index ${i} is ${down[i]}.` })
  }
  let best = 0
  for (let i = 1; i < n - 1; i++) {
    if (up[i] >= 2 && down[i] >= 2) best = Math.max(best, up[i] + down[i] - 1)
    frames.push({ phase: 'peak', pythonLine: 15, activeLine: L('if (up[i] >= 2'), index: i, up: [...up], down: [...down], best, message: `Peak at index ${i} keeps ${up[i] >= 2 && down[i] >= 2 ? up[i] + down[i] - 1 : 0} values.` })
  }
  const result = n - best
  frames.push({ phase: 'done', pythonLine: 17, activeLine: L('return n - best'), index: -1, up: [...up], down: [...down], best, message: `Keep ${best} values and remove ${result}.` })
  return { input, result, frames }
}

export const code = `function minimumMountainRemovals(nums) {
  const n = nums.length
  const up = Array(n).fill(1)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) up[i] = Math.max(up[i], up[j] + 1)
    }
  }
  const down = Array(n).fill(1)
  for (let i = n - 1; i >= 0; i--) {
    for (let j = i + 1; j < n; j++) {
      if (nums[j] < nums[i]) down[i] = Math.max(down[i], down[j] + 1)
    }
  }
  let best = 0
  for (let i = 1; i < n - 1; i++) {
    if (up[i] >= 2 && down[i] >= 2) best = Math.max(best, up[i] + down[i] - 1)
  }
  return n - best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_mountain_removals(nums):
    n = len(nums)
    up = [1] * n
    for i in range(n):
        for j in range(i):
            if nums[j] < nums[i]:
                up[i] = max(up[i], up[j] + 1)
    down = [1] * n
    for i in range(n - 1, -1, -1):
        for j in range(i + 1, n):
            if nums[j] < nums[i]:
                down[i] = max(down[i], down[j] + 1)
    best = 0
    for i in range(1, n - 1):
        if up[i] >= 2 and down[i] >= 2:
            best = max(best, up[i] + down[i] - 1)
    return n - best
`
