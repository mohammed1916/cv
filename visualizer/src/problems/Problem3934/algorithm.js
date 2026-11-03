export const phases = [
  { id: 'start', label: 'Setup', description: 'Start with the longest possible answer.' },
  { id: 'window', label: 'Start index', description: 'Test the subarrays that begin here.' },
  { id: 'compare', label: 'Compare', description: 'Measure how far this start agrees with another start.' },
  { id: 'record', label: 'Record', description: 'A unique subarray of this length fits here.' },
  { id: 'skip', label: 'Skip', description: 'The unique length would run past the array end.' },
  { id: 'done', label: 'Result', description: 'Report the shortest unique length.' },
]

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Use a JSON array of 1 to 12 integers.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('Each value is an integer from 1 to 100.')
  return { nums }
}

export function buildTrace({ nums }) {
  const n = nums.length
  let best = n
  const frames = [{ phase: 'start', activeLine: L('let best be n'), pythonLine: P('best = n'), message: `Start with the whole array length ${n} as the best answer.`, i: -1, j: -1, shared: null, longest: null, length: null, best }]
  for (let i = 0; i < n; i++) {
    let longest = 0
    frames.push({ phase: 'window', activeLine: L('for each start index i'), pythonLine: P('for i in range(n)'), message: `Subarrays that start at ${i} are checked against every other start.`, i, j: -1, shared: null, longest, length: null, best })
    for (let j = 0; j < n; j++) {
      if (j === i) continue
      let shared = 0
      while (i + shared < n && j + shared < n && nums[i + shared] === nums[j + shared]) shared++
      longest = Math.max(longest, shared)
      frames.push({ phase: 'compare', activeLine: L('let shared be'), pythonLine: P('while i + k < n'), message: `Starts ${i} and ${j} agree on ${shared} value${shared === 1 ? '' : 's'} from the front.`, i, j, shared, longest, length: null, best })
    }
    const length = longest + 1
    if (i + length <= n) {
      best = Math.min(best, length)
      frames.push({ phase: 'record', activeLine: L('if a subarray of that length fits'), pythonLine: P('best = min(best, length)'), message: `A subarray of length ${length} at ${i} occurs only there. Best is now ${best}.`, i, j: -1, shared: null, longest, length, best })
    } else {
      frames.push({ phase: 'skip', activeLine: L('if a subarray of that length fits'), pythonLine: P('if i + length <= n'), message: `Length ${length} from ${i} would run past the end, so this start is ignored.`, i, j: -1, shared: null, longest, length, best })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), pythonLine: P('return best'), message: `The shortest unique subarray has length ${best}.`, i: -1, j: -1, shared: null, longest: null, length: null, best })
  return { input: { nums }, result: best, frames }
}

export const code = `find the shortest subarray that occurs once
  let best be n
  for each start index i
    let longest be 0
    for each other start index j
      let shared be the length of the common prefix of the subarrays at i and j
      set longest to the larger of longest and shared
    let length be longest plus one
    if a subarray of that length fits at i then set best to the smaller of best and length
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(line => line.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def smallest_unique_subarray(nums):
    n = len(nums)
    best = n
    for i in range(n):
        longest = 0
        for j in range(n):
            if j == i:
                continue
            k = 0
            while i + k < n and j + k < n and nums[i + k] == nums[j + k]:
                k += 1
            longest = max(longest, k)
        length = longest + 1
        if i + length <= n:
            best = min(best, length)
    return best`

const pyLines = python.split('\n')
const P = s => {
  const index = pyLines.findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}
