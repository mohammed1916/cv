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
  frames.push({ pythonLine: PY('total = sum'), phase: 'average', activeLine: L('const total'), candidate: null, taken: false, message: `The sum is ${total} over ${nums.length} values, so the average is ${average.toFixed(2)}.` })
  let candidate = Math.max(1, Math.floor(total / nums.length) + 1)
  frames.push({ pythonLine: PY('candidate = max'), phase: 'start', activeLine: L('let candidate'), candidate, taken: taken.has(candidate), message: `Start at ${candidate}, the first integer strictly above the average.` })
  for (;;) {
    const present = taken.has(candidate)
    frames.push({ pythonLine: PY('while candidate'), phase: 'check', activeLine: L('while (taken'), candidate, taken: present, message: present ? `${candidate} is in nums; try the next integer.` : `${candidate} is absent and above the average.` })
    if (!present) break
    candidate += 1
  }
  frames.push({ pythonLine: PY('return candidate'), phase: 'done', activeLine: L('return candidate'), candidate, taken: false, message: `The answer is ${candidate}.` })
  return { input: { nums }, result: candidate, frames }
}

export const code = `function smallestAbsentAboveAverage(nums) {
  const total = nums.reduce((sum, v) => sum + v, 0)
  const taken = new Set(nums)
  let candidate = Math.max(1, Math.floor(total / nums.length) + 1)
  while (taken.has(candidate)) candidate += 1
  return candidate
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const hit = code.find(c => c.text.includes(s))
  if (!hit) throw new Error(`No JavaScript line contains "${s}".`)
  return hit.line
}

export const python = `def smallest_absent_above_average(nums):
    taken = set(nums)
    total = sum(nums)
    candidate = max(1, total // len(nums) + 1)
    while candidate in taken:
        candidate += 1
    return candidate
`
const PY = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`No Python line contains "${s}".`)
  return index + 1
}
