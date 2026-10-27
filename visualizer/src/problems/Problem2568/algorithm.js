export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with one key, nums.')
  const { nums } = data
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 30) throw new Error('nums must be an array of 1 to 30 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 1000)) throw new Error('Each value is an integer from 1 to 1000.')
  return { nums }
}

export function buildTrace({ nums }) {
  const present = new Set(nums)
  const frames = []
  frames.push({ phase: 'start', activeLine: L('put every number'), candidate: 1, present: [...present], message: 'Store the numbers in a set for quick lookup.' })
  let candidate = 1
  while (present.has(candidate)) {
    frames.push({ phase: 'check', activeLine: L('while candidate is in the set'), candidate, present: [...present], message: `${candidate} is in nums, so try the next power of two.` })
    candidate *= 2
  }
  frames.push({ phase: 'found', activeLine: L('while candidate is in the set'), candidate, present: [...present], message: `${candidate} is not in nums, so no subsequence can produce it.` })
  frames.push({ phase: 'done', activeLine: L('return candidate'), candidate, present: [...present], message: `Minimum impossible OR: ${candidate}.` })
  return { input: { nums }, result: candidate, frames }
}

export const code = `minimum impossible OR
  put every number of nums into a set
  set candidate to 1
  while candidate is in the set do
    double candidate
  return candidate`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error('missing code line: ' + s); return i + 1 }

export const python = `def minimum_impossible_or(nums):
    present = set(nums)
    candidate = 1
    while candidate in present:
        candidate *= 2
    return candidate
`
