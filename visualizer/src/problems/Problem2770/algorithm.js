export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).sort().join() !== 'nums,target') {
    throw new Error('Use an object with exactly the keys nums and target.')
  }
  const { nums, target } = data
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 10) throw new Error('Use 1 to 10 numbers.')
  if (nums.some(v => !Number.isInteger(v) || v < -20 || v > 20)) throw new Error('Numbers are integers from -20 to 20.')
  if (!Number.isInteger(target) || target < 0 || target > 40) throw new Error('target is an integer from 0 to 40.')
  return data
}

export function buildTrace(data) {
  const { nums, target } = data
  const n = nums.length
  const jumps = Array(n).fill(-1)
  jumps[0] = 0
  const frames = [{ phase: 'start', activeLine: L('set jumps[0] to 0'), i: 0, jumps: [...jumps], message: 'Index 0 is reached with 0 jumps. Unreached indices are -1.' }]
  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (jumps[j] >= 0 && Math.abs(nums[i] - nums[j]) <= target) {
        jumps[i] = Math.max(jumps[i], jumps[j] + 1)
      }
    }
    frames.push({ phase: 'index', activeLine: L('keep the largest'), i, jumps: [...jumps], message: `Index ${i} (value ${nums[i]}): the most jumps that reach it is ${jumps[i]}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return jumps[n-1]'), i: n - 1, jumps: [...jumps], message: `The most jumps to reach the last index is ${jumps[n - 1]}.` })
  return { input: data, result: jumps[n - 1], frames, jumps }
}

export const code = `most jumps to reach the last index:
  set jumps[0] to 0 and every other entry to -1
  for each index i from 1 to n-1:
    for each earlier index j that is reachable:
      if the difference is at most target then
        keep the largest jumps[j] + 1 in jumps[i]
  return jumps[n-1]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_jumps(nums, target):
    n = len(nums)
    jumps = [-1] * n
    jumps[0] = 0
    for i in range(1, n):
        for j in range(i):
            if jumps[j] >= 0 and abs(nums[i] - nums[j]) <= target:
                jumps[i] = max(jumps[i], jumps[j] + 1)
    return jumps[n - 1]
`
