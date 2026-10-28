export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a nums array.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 12) throw new Error('nums must have 2 to 12 entries.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 20)) throw new Error('Each value must be an integer from 1 to 20.')
  return { nums }
}

export function buildTrace(input) {
  const { nums } = input
  const n = nums.length
  let best = -1
  const frames = [{ phase: 'start', activeLine: L('set best to -1'), start: -1, end: -1, best, message: 'Look for a start where the next value is one larger.' }]
  for (let a = 0; a <= n - 2; a++) {
    if (nums[a + 1] - nums[a] !== 1) continue
    let length = 2
    let expected = -1
    frames.push({ phase: 'start', activeLine: L('set length to 2'), start: a, end: a + 1, best, message: `Start at ${a}: ${nums[a]} then ${nums[a + 1]} rises by 1.` })
    for (let b = a + 2; b < n; b++) {
      if (nums[b] - nums[b - 1] !== expected) {
        frames.push({ phase: 'stop', activeLine: L('otherwise stop this start'), start: a, end: b, best, message: `The pattern breaks at index ${b}.` })
        break
      }
      length++
      expected = -expected
      frames.push({ phase: 'extend', activeLine: L('if nums[b] - nums[b-1] equals expected'), start: a, end: b, best: Math.max(best, length), message: `Extend to index ${b}; the run is ${length} long.` })
    }
    best = Math.max(best, length)
  }
  frames.push({ phase: 'done', activeLine: L('return best'), start: -1, end: -1, best, message: best === -1 ? 'No alternating subarray of length 2 or more.' : `Longest alternating subarray: ${best}.` })
  return { input, result: best, frames }
}

export const code = `longest alternating subarray (nums):
  set best to -1
  for each start a from 0 to n - 2:
    if nums[a + 1] - nums[a] is not 1 then skip this start
    set length to 2
    set expected to -1
    for each index b from a + 2 to n - 1:
      if nums[b] - nums[b-1] equals expected then add 1 to length and flip expected
      otherwise stop this start
    set best to the larger of best and length
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def longest_alternating_subarray(nums):
    n = len(nums)
    best = -1
    for a in range(n - 1):
        if nums[a + 1] - nums[a] != 1:
            continue
        length = 2
        expected = -1
        for b in range(a + 2, n):
            if nums[b] - nums[b - 1] != expected:
                break
            length += 1
            expected = -expected
        best = max(best, length)
    return best
`
