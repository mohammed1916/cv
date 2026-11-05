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
  frames.push({ pythonLine: P('best = 0'), phase: 'start', activeLine: L('let best'), start: -1, at: -1, best, evens: [], odds: [], message: 'Start with no balanced subarray found.' })
  for (let i = 0; i < nums.length; i++) {
    const evens = new Set()
    const odds = new Set()
    frames.push({ pythonLine: P('evens = set()'), phase: 'window', activeLine: L('const evens'), start: i, at: -1, best, evens: [], odds: [], message: `Begin subarrays at index ${i} with empty sets.` })
    for (let j = i; j < nums.length; j++) {
      const isEven = nums[j] % 2 === 0
      if (isEven) evens.add(nums[j]); else odds.add(nums[j])
      frames.push({ pythonLine: P(isEven ? 'evens.add' : 'odds.add'), phase: 'extend', activeLine: L(isEven ? 'evens.add' : 'odds.add'), start: i, at: j, best,
        evens: [...evens], odds: [...odds], message: `${nums[j]} is ${isEven ? 'even' : 'odd'}; distinct evens ${evens.size}, distinct odds ${odds.size}.` })
      const balanced = evens.size === odds.size
      frames.push({ pythonLine: P('if len(evens)'), phase: 'check', activeLine: L('if (evens.size'), start: i, at: j, ok: balanced, best,
        evens: [...evens], odds: [...odds], message: balanced ? 'Distinct even and odd counts match.' : 'The distinct counts differ.' })
      if (balanced && j - i + 1 > best) {
        best = j - i + 1
        frames.push({ pythonLine: P('best = j - i + 1'), phase: 'update', activeLine: L('best = j - i + 1'), start: i, at: j, ok: true, best,
          evens: [...evens], odds: [...odds], message: `Length ${best} is the new best.` })
      }
    }
  }
  frames.push({ pythonLine: P('return best'), phase: 'done', activeLine: L('return best'), start: -1, at: -1, ok: best > 0, best, evens: [], odds: [], message: `The longest balanced subarray has length ${best}.` })
  return { input: { nums }, result: best, frames }
}

export const code = `function longestBalancedSubarray(nums) {
  let best = 0
  for (let i = 0; i < nums.length; i++) {
    const evens = new Set()
    const odds = new Set()
    for (let j = i; j < nums.length; j++) {
      if (nums[j] % 2 === 0) evens.add(nums[j])
      else odds.add(nums[j])
      if (evens.size === odds.size && j - i + 1 > best) best = j - i + 1
    }
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const hit = code.find(c => c.text.includes(s))
  if (!hit) throw new Error(`No JavaScript line contains "${s}".`)
  return hit.line
}
const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`No Python line contains "${s}".`)
  return index + 1
}

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
