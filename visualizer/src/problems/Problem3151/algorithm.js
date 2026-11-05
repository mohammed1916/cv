export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 100 || !nums.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('Use a JSON array of 1 to 100 integers from 1 to 100.')
  return nums
}

export function buildTrace(nums) {
  const frames = []
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('for (let i = 0'), at: -1, message: 'Check every adjacent pair from the left.' })
  for (let i = 0; i + 1 < nums.length; i++) {
    const sameParity = (nums[i] + nums[i + 1]) % 2 === 0
    if (sameParity) {
      frames.push({ pythonLine: 4, phase: 'fail', activeLine: L('return false'), at: i, ok: false, message: `${nums[i]} and ${nums[i + 1]} have the same parity.` })
      return { input: nums, result: false, frames }
    }
    frames.push({ pythonLine: 2, phase: 'pair', activeLine: L('for (let i = 0'), at: i, ok: true, message: `${nums[i]} and ${nums[i + 1]} alternate in parity.` })
  }
  frames.push({ pythonLine: 5, phase: 'done', activeLine: L('return true'), at: -1, ok: true, message: 'Every adjacent pair alternates, so the array is special.' })
  return { input: nums, result: true, frames }
}

export const code = `function isSpecial(nums) {
  for (let i = 0; i + 1 < nums.length; i++) {
    if ((nums[i] + nums[i + 1]) % 2 === 0) return false
  }
  return true
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def is_special(nums):
    for i in range(len(nums) - 1):
        if (nums[i] + nums[i + 1]) % 2 == 0:
            return False
    return True
`
