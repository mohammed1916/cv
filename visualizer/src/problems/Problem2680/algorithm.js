export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with nums and k.')
  const { nums, k } = data
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums must be an array of 1 to 12 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 100)) throw new Error('Each value is an integer from 1 to 100.')
  if (!Number.isInteger(k) || k < 0 || k > 6) throw new Error('k must be an integer from 0 to 6.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const n = nums.length
  const prefix = Array(n + 1).fill(0)
  for (let i = 0; i < n; i++) prefix[i + 1] = prefix[i] | nums[i]
  const suffix = Array(n + 1).fill(0)
  for (let i = n - 1; i >= 0; i--) suffix[i] = suffix[i + 1] | nums[i]
  const frames = []
  let best = 0
  frames.push({ phase: 'tables', activeLine: L('build prefix OR'), index: -1, candidate: null, best, message: 'Build prefix and suffix OR tables.' })
  for (let i = 0; i < n; i++) {
    const candidate = prefix[i] | (nums[i] << k) | suffix[i + 1]
    frames.push({ phase: 'try', activeLine: L('candidate is'), index: i, candidate, best, message: `Double ${nums[i]} ${k} times: OR with the others gives ${candidate}.` })
    if (candidate > best) {
      best = candidate
      frames.push({ phase: 'record', activeLine: L('set best to the candidate'), index: i, candidate, best, message: `New best ${best}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), index: -1, candidate: null, best, message: `Maximum OR: ${best}.` })
  return { input: { nums, k }, result: best, frames }
}

export const code = `maximum OR after doubling one element up to k times
  build prefix OR tables from the left and the right
  set best to 0
  for each index i do
    candidate is prefix OR before i, OR nums[i] shifted left by k, OR suffix OR after i
    if candidate is greater than best then
      set best to the candidate
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error('missing code line: ' + s); return i + 1 }

export const python = `def maximum_or(nums, k):
    n = len(nums)
    prefix = [0] * (n + 1)
    for i in range(n):
        prefix[i + 1] = prefix[i] | nums[i]
    suffix = [0] * (n + 1)
    for i in range(n - 1, -1, -1):
        suffix[i] = suffix[i + 1] | nums[i]
    best = 0
    for i in range(n):
        best = max(best, prefix[i] | (nums[i] << k) | suffix[i + 1])
    return best
`
