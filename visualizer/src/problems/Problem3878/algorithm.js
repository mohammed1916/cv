const codeLines = `count the good subarrays
  set count to 0
  for each left end l
    set running to 0
    for each right end r from l onward
      running becomes running OR nums[r]
      if nums[l..r] contains running then add one to count
  return count`.split('\n').map((text, index) => ({ line: index + 1, text: text.trim() }))
const L = s => codeLines.findIndex(c => c.text.includes(s)) + 1
const pythonLines = `def count_good(nums):
    count = 0
    for l in range(len(nums)):
        running = 0
        for r in range(l, len(nums)):
            running |= nums[r]
            if running in nums[l:r + 1]:
                count += 1
    return count`.split('\n')
const P = s => pythonLines.findIndex(t => t.includes(s)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.nums)) throw new Error('Use an object with nums, a list of integers.')
  const nums = input.nums
  if (nums.length < 1 || nums.length > 12) throw new Error('nums has 1 to 12 values in this visual.')
  if (!nums.every(v => Number.isInteger(v) && v >= 0 && v <= 15)) throw new Error('Values are integers from 0 to 15.')
  return { nums }
}

export function buildTrace({ nums }) {
  const frames = []
  let count = 0
  for (let l = 0; l < nums.length; l++) {
    let running = 0
    for (let r = l; r < nums.length; r++) {
      running |= nums[r]
      const good = nums.slice(l, r + 1).includes(running)
      if (good) count++
      frames.push({ phase: 'window', activeLine: L('running becomes'), pythonLine: P('running |= '), left: l, right: r, running, good, count,
        message: `[${l}..${r}] OR is ${running}: ${good ? 'present, so it is good' : 'absent, so it is not good'}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return count'), pythonLine: P('return count'), left: -1, right: -1, running: null, good: null, count,
    message: `${count} good subarray${count === 1 ? '' : 's'} in total.` })
  return { input: { nums }, result: count, frames }
}

export const code = codeLines
export const python = pythonLines.join('\n')
