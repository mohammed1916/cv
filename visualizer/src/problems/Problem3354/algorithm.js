export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with nums.')
  const { nums } = data
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 10) throw new Error('nums holds 1 to 10 values.')
  if (nums.some(v => !Number.isInteger(v) || v < 0 || v > 5)) throw new Error('Each value is an integer from 0 to 5.')
  return { nums }
}

export function buildTrace(input) {
  const { nums } = input
  const n = nums.length
  let count = 0
  const frames = [{ phase: 'start', activeLine: L('set count to 0'), start: -1, dir: 0, pos: -1, arr: [...nums], count, message: 'Count the valid choices, starting from each zero.' }]
  for (let i = 0; i < n; i++) {
    if (nums[i] !== 0) continue
    for (const d of [-1, 1]) {
      const arr = [...nums]
      let pos = i
      let dir = d
      frames.push({ phase: 'trial', activeLine: L('for each index i where'), start: i, dir, pos, arr: [...arr], count, message: `Start at zero ${i} moving ${d < 0 ? 'left' : 'right'}.` })
      while (pos >= 0 && pos < n) {
        if (arr[pos] === 0) {
          pos += dir
          frames.push({ phase: 'move', activeLine: L('if arr[pos] equals 0'), start: i, dir, pos: Math.min(Math.max(pos, 0), n - 1), arr: [...arr], count, message: 'The cell is 0, so keep moving.' })
        } else {
          arr[pos] -= 1
          dir = -dir
          pos += dir
          frames.push({ phase: 'bounce', activeLine: L('otherwise subtract 1'), start: i, dir, pos: Math.min(Math.max(pos, 0), n - 1), arr: [...arr], count, message: 'The cell is nonzero, so it drops by one and the direction reverses.' })
        }
      }
      const valid = arr.every(v => v === 0)
      if (valid) count += 1
      frames.push({ phase: valid ? 'valid' : 'invalid', activeLine: L('if every value'), start: i, dir, pos: -1, arr: [...arr], count, message: valid ? `Choice (${i}, ${d < 0 ? 'left' : 'right'}) leaves all zeros. Count: ${count}.` : `Choice (${i}, ${d < 0 ? 'left' : 'right'}) leaves a nonzero value.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return count'), start: -1, dir: 0, pos: -1, arr: [...nums], count, message: `Valid choices: ${count}.` })
  return { input, result: count, frames }
}

export const code = `count the valid choices
  set count to 0
  for each index i where nums[i] equals 0
    for each direction d in left and right
      copy nums into arr, set pos to i, and set dir to d
      while pos is inside the array
        if arr[pos] equals 0 then move pos by dir
        otherwise subtract 1 from arr[pos], reverse dir, and move pos by dir
      if every value in arr is 0 then add 1 to count
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_valid_choices(nums):
    count = 0
    n = len(nums)
    for i in range(n):
        if nums[i] != 0:
            continue
        for d in (-1, 1):
            arr = list(nums)
            pos = i
            dr = d
            while 0 <= pos < n:
                if arr[pos] == 0:
                    pos += dr
                else:
                    arr[pos] -= 1
                    dr = -dr
                    pos += dr
            if all(v == 0 for v in arr):
                count += 1
    return count
`
