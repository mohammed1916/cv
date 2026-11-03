export const code = `whether the middle value of an odd-length array occurs exactly once
  set mid to the length divided by two, rounded down
  set target to the value at mid
  set count to 0
  for each index i from 0 to the last index
    if the value at i equals target then add one to count
  return whether count equals 1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = text => {
  const at = code.findIndex(c => c.text.includes(text))
  if (at < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return at + 1
}

export const python = `def unique_middle_element(nums):
    mid = len(nums) // 2
    target = nums[mid]
    count = 0
    for value in nums:
        if value == target:
            count += 1
    return count == 1
`
const pyLines = python.split('\n')
const P = text => {
  const at = pyLines.findIndex(line => line.includes(text))
  if (at < 0) throw new Error(`Missing python line: ${text}`)
  return at + 1
}

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 15 || nums.length % 2 === 0) {
    throw new Error('Use an odd-length array of 1 to 15 integers.')
  }
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('Values are integers from 1 to 100.')
  return nums
}

export function buildTrace(nums) {
  const mid = Math.floor(nums.length / 2)
  const target = nums[mid]
  const frames = []
  let count = 0
  frames.push({ pythonLine: P('mid = '), phase: 'start', activeLine: L('set mid'), mid, target, at: -1, count, ok: null, message: `The middle index is ${mid}, which holds ${target}.` })
  frames.push({ pythonLine: P('target = '), phase: 'start', activeLine: L('set target'), mid, target, at: mid, count, ok: null, message: `Target is ${target}. Count its occurrences.` })
  for (let i = 0; i < nums.length; i++) {
    const same = nums[i] === target
    if (same) count += 1
    frames.push({
      pythonLine: P('if value == target'), phase: 'scan', activeLine: L('if the value at i equals target'),
      mid, target, at: i, count, ok: null,
      message: same ? `Index ${i} also holds ${target}; count rises to ${count}.` : `Index ${i} holds ${nums[i]}, not ${target}.`,
    })
  }
  const result = count === 1
  frames.push({ pythonLine: P('return count == 1'), phase: 'done', activeLine: L('return whether count equals 1'), mid, target, at: -1, count, ok: result,
    message: result ? `${target} occurs exactly once, so the answer is true.` : `${target} occurs ${count} times, so the answer is false.` })
  return { input: nums, mid, target, result, frames }
}
