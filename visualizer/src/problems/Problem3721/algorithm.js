export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 16 || !nums.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('nums has 1 to 16 integers from 1 to 100.')
  return { nums }
}

export function buildTrace({ nums }) {
  const frames = []
  let best = 0
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('best = 0'), start: -1, at: -1, best, message: 'Start with no balanced subarray found.' })
  for (let i = 0; i < nums.length; i++) {
    const evens = new Set()
    const odds = new Set()
    frames.push({ pythonLine: 5, phase: 'window', activeLine: L('empty sets'), start: i, at: -1, best, message: `Begin subarrays at index ${i} with empty sets.` })
    for (let j = i; j < nums.length; j++) {
      const isEven = nums[j] % 2 === 0
      if (isEven) evens.add(nums[j]); else odds.add(nums[j])
      frames.push({ pythonLine: isEven ? 9 : 11, phase: 'extend', activeLine: L('add it to'), start: i, at: j, best, message: `${nums[j]} is ${isEven ? 'even' : 'odd'}; distinct evens ${evens.size}, distinct odds ${odds.size}.` })
      const balanced = evens.size === odds.size
      frames.push({ pythonLine: 12, phase: 'check', activeLine: L('if the counts'), start: i, at: j, ok: balanced, best, message: balanced ? 'Distinct even and odd counts match.' : 'The distinct counts differ.' })
      if (balanced && j - i + 1 > best) {
        best = j - i + 1
        frames.push({ pythonLine: 13, phase: 'update', activeLine: L('best = max'), start: i, at: j, ok: true, best, message: `Length ${best} is the new best.` })
      }
    }
  }
  frames.push({ pythonLine: 14, phase: 'done', activeLine: L('return best'), start: -1, at: -1, ok: best > 0, best, message: `The longest balanced subarray has length ${best}.` })
  return { input: { nums }, result: best, frames }
}

export const code = `longest balanced subarray length
  best = 0
  for each start index i
    evens = empty set, odds = empty set
    for each end index j from i to the end
      if nums at j is even then add it to evens else add it to odds
      if size of evens equals size of odds then
        best = max(best, j - i + 1)
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def longest_balanced_subarray(nums):
    best = 0
    n = len(nums)
    for i in range(n):
        evens = set()
        odds = set()
        for j in range(i, n):
            if nums[j] % 2 == 0:
                evens.add(nums[j])
            else:
                odds.add(nums[j])
            if len(evens) == len(odds) and j - i + 1 > best:
                best = j - i + 1
    return best
`
