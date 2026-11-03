const L = s => code.findIndex(c => c.text.includes(s)) + 1
const PY = s => python.split('\n').findIndex(line => line.includes(s)) + 1

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 100) throw new Error('Use a JSON array of 1 to 100 integers.')
  if (!nums.every(v => Number.isInteger(v) && v >= -100 && v <= 100)) throw new Error('Each value must be an integer from -100 to 100.')
  return { nums }
}

export function buildTrace({ nums }) {
  const total = nums.reduce((sum, v) => sum + v, 0)
  const taken = new Set(nums)
  const frames = []
  const average = total / nums.length
  frames.push({ pythonLine: PY('total = sum'), phase: 'average', activeLine: L('average'), candidate: null, taken: false, message: `The sum is ${total} over ${nums.length} values, so the average is ${average.toFixed(2)}.` })
  let candidate = Math.max(1, Math.floor(total / nums.length) + 1)
  for (;;) {
    const present = taken.has(candidate)
    frames.push({ pythonLine: PY('while candidate'), phase: 'check', activeLine: L('while candidate'), candidate, taken: present, message: present ? `${candidate} is in nums; try the next integer.` : `${candidate} is absent and above the average.` })
    if (!present) break
    candidate += 1
  }
  frames.push({ pythonLine: PY('return candidate'), phase: 'done', activeLine: L('return candidate'), candidate, taken: false, message: `The answer is ${candidate}.` })
  return { input: { nums }, result: candidate, frames }
}

export const code = [
  'smallest absent positive greater than the average',
  '  total = sum of nums',
  '  candidate starts at max(1, floor(total / count) + 1)',
  '  while candidate is in nums: add one',
  '  return candidate',
].map((text, index) => ({ line: index + 1, text }))

export const python = `def smallest_absent_above_average(nums):
    taken = set(nums)
    total = sum(nums)
    candidate = max(1, total // len(nums) + 1)
    while candidate in taken:
        candidate += 1
    return candidate
`
