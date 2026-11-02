export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Use a JSON array of 1 to 12 integers.')
  if (!nums.every(x => Number.isInteger(x) && x >= -100 && x <= 100)) throw new Error('Each value is an integer from -100 to 100.')
  return nums
}

export function buildTrace(nums) {
  const frames = []
  const seen = new Set()
  let total = 0
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('start with no values seen'), at: -1, ok: null, total, message: 'No positive value has been taken yet.' })
  nums.forEach((x, index) => {
    if (x > 0 && !seen.has(x)) {
      seen.add(x)
      total += x
      frames.push({ pythonLine: 7, phase: 'take', activeLine: L('mark x as seen'), at: index, ok: true, total, message: `Keep the first ${x}; total is ${total}.` })
      return
    }
    const reason = x <= 0 ? `${x} is not positive` : `${x} was already kept`
    frames.push({ pythonLine: 5, phase: 'skip', activeLine: L('if x is positive'), at: index, ok: false, total, message: `Skip index ${index}: ${reason}.` })
  })
  if (total > 0) {
    frames.push({ pythonLine: 9, phase: 'done', activeLine: L('return the total'), at: -1, ok: true, total, message: `Positive values give ${total}.` })
    return { input: nums, result: total, frames }
  }
  const best = Math.max(...nums)
  frames.push({ pythonLine: 10, phase: 'done', activeLine: L('return the largest value'), at: nums.indexOf(best), ok: true, total: best, message: `No positive value exists, so the answer is the largest value ${best}.` })
  return { input: nums, result: best, frames }
}

export const code = `find the largest total of distinct values a kept subarray can have
  start with no values seen and a total of 0
  for each value x in nums
    if x is positive and not seen yet then
      mark x as seen and add x to the total
  if the total is above 0 then return the total
  otherwise return the largest value in nums`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_unique_sum(nums):
    seen = set()
    total = 0
    for x in nums:
        if x > 0 and x not in seen:
            seen.add(x)
            total += x
    if total > 0:
        return total
    return max(nums)
`
