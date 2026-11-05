export const phases = [
  { id: 'scan', label: 'Scan positions', description: 'Walk left to right and find each 1.' },
  { id: 'gap', label: 'Measure the gap', description: 'Count the zeros between this 1 and the previous 1.' },
  { id: 'answer', label: 'Answer', description: 'Every gap was long enough, or a short gap ends the scan early.' },
]

const PYTHON = `def k_length_apart(nums, k):
    last = None
    for i, x in enumerate(nums):
        if x == 1:
            if last is not None and i - last - 1 < k:
                return False
            last = i

    return True
`

export const python = PYTHON
export const code = `function kLengthApart(nums, k) {
  let last = null
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] === 1) {
      if (last !== null && i - last - 1 < k) return false
      last = i
    }
  }
  return true
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
export const pythonLineMap = Object.fromEntries(code.map(({ line }) => [line, line]))
const lineAt = marker => code.find(({ text }) => text.includes(marker)).line

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || Array.isArray(data) || !Array.isArray(data.nums) || !Number.isInteger(data.k)) {
    throw new Error('Enter an object like {"nums": [1,0,1], "k": 2}.')
  }
  if (data.nums.length < 1 || data.nums.length > 30) throw new Error('nums must have between 1 and 30 entries.')
  if (!data.nums.every(x => x === 0 || x === 1)) throw new Error('Every entry of nums must be 0 or 1.')
  if (data.k < 0 || data.k > 30) throw new Error('k must be between 0 and 30.')
  return { nums: data.nums, k: data.k }
}

/** Visits each position once; the first pair of 1s that is too close ends the scan with false. */
export function buildTrace({ nums, k }) {
  const frames = []
  let last = null
  let verdict = null
  const snap = (index, gap) => ({ nums, k, index, last, gap, verdict })

  frames.push({ phase: 'scan', activeLine: lineAt('let last = null'), message: `Nothing seen yet. The required distance is k = ${k}.`, snapshot: snap(null, null) })
  for (let i = 0; i < nums.length && verdict === null; i++) {
    const x = nums[i]
    frames.push({ phase: 'scan', activeLine: lineAt('for (let i = 0'), message: `Position ${i} holds ${x}.`, snapshot: snap(i, null) })
    if (x !== 1) continue
    if (last !== null) {
      const gap = i - last - 1
      frames.push({
        phase: 'gap', activeLine: lineAt('i - last - 1 < k'),
        message: `The previous 1 was at ${last}. Between it and position ${i} there are ${gap} zeros, which is ${gap < k ? 'too few' : 'enough'} for k = ${k}.`,
        snapshot: snap(i, gap),
      })
      if (gap < k) {
        verdict = false
        frames.push({ phase: 'answer', activeLine: lineAt('return false'), message: 'Two 1s are too close, so the answer is false.', snapshot: snap(i, gap) })
        break
      }
    }
    last = i
    frames.push({ phase: 'scan', activeLine: lineAt('last = i'), message: `Remember position ${i} as the latest 1.`, snapshot: snap(i, null) })
  }
  if (verdict === null) {
    verdict = true
    frames.push({ phase: 'answer', activeLine: lineAt('return true'), message: 'Every pair of 1s is far enough apart, so the answer is true.', snapshot: snap(null, null) })
  }
  return { input: { nums, k }, result: verdict, frames }
}
