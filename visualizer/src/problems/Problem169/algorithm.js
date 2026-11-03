export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with no candidate and a vote count of 0.' },
  { id: 'adopt', label: 'Adopt candidate', description: 'When the count is 0, the current value becomes the candidate.' },
  { id: 'vote', label: 'Vote', description: 'Matching values add a vote. Other values cancel one vote.' },
  { id: 'done', label: 'Candidate', description: 'The surviving candidate is the majority value.' },
]

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 30 || !nums.every(v => Number.isInteger(v) && v >= -100 && v <= 100)) {
    throw new Error('Enter a JSON array of 1 to 30 integers from -100 to 100.')
  }
  const counts = new Map()
  for (const v of nums) counts.set(v, (counts.get(v) ?? 0) + 1)
  if (![...counts.values()].some(c => c > nums.length / 2)) throw new Error('The list must contain one value that appears more than half the time.')
  return nums
}

export const code = `majority element (nums):
  candidate = none, count = 0
  for each value v in nums:
    if count == 0: candidate = v
    if v == candidate: count += 1
    else: count -= 1
  return candidate`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def majority_element(nums):
    candidate, count = None, 0
    for num in nums:
        if count == 0:
            candidate = num
        count += 1 if num == candidate else -1
    return candidate
`

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
const at = (pseudo, py) => ({ activeLine: L(pseudo), pythonLine: P(py) })

export function buildTrace(nums) {
  let candidate = null
  let count = 0
  const frames = [{ phase: 'start', ...at('candidate = none', 'candidate, count = None'), snapshot: { nums, index: -1, candidate, count }, message: 'No candidate yet and the vote count is 0.' }]
  nums.forEach((v, i) => {
    if (count === 0) {
      candidate = v
      frames.push({ phase: 'adopt', ...at('if count == 0', 'if count == 0'), snapshot: { nums, index: i, candidate, count }, message: `The count is 0, so ${v} at index ${i} becomes the candidate.` })
    }
    if (v === candidate) {
      count += 1
      frames.push({ phase: 'vote', ...at('if v == candidate', 'count += 1 if'), snapshot: { nums, index: i, candidate, count }, message: `${v} matches the candidate, so the count rises to ${count}.` })
    } else {
      count -= 1
      frames.push({ phase: 'vote', ...at('count -= 1', 'count += 1 if'), snapshot: { nums, index: i, candidate, count }, message: `${v} differs from the candidate ${candidate}, so one vote cancels and the count falls to ${count}.` })
    }
  })
  frames.push({ phase: 'done', ...at('return candidate', 'return candidate'), snapshot: { nums, index: nums.length, candidate, count }, message: `${candidate} is the candidate that survives the vote, so it is the majority value.` })
  return { input: nums, result: candidate, frames }
}
