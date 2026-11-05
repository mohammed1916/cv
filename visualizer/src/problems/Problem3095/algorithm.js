export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with nums and k.')
  const { nums, k } = data
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 30) throw new Error('nums must be an array of 1 to 30 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 0 || v > 255)) throw new Error('Each value is an integer from 0 to 255.')
  if (!Number.isInteger(k) || k < 1 || k > 255) throw new Error('k must be an integer from 1 to 255.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const frames = []
  let best = null
  const frame = (phase, line, start, end, or, message, pythonLine) => frames.push({ phase, activeLine: line, pythonLine, start, end, or, best, message })
  frame('start', L('let best = null'), -1, -1, 0, 'No subarray has been checked yet.', 2)
  for (let s = 0; s < nums.length; s++) {
    let or = 0
    frame('start-index', L('let or = 0'), s, s - 1, or, `Grow subarrays that start at ${s}.`, 4)
    for (let e = s; e < nums.length; e++) {
      or |= nums[e]
      frame('extend', L('or |= nums[e]'), s, e, or, `Subarray ${s}-${e} has OR ${or}.`, 6)
      if (or >= k) {
        const length = e - s + 1
        best = best === null ? length : Math.min(best, length)
        frame('hit', L('best = best === null'), s, e, or, `OR ${or} reaches ${k}; length ${length}.`, 9)
        break
      }
    }
  }
  frame('done', L('return best === null'), -1, -1, 0, best === null ? 'No subarray reaches k.' : `Shortest length: ${best}.`, 12)
  return { input: { nums, k }, result: best === null ? -1 : best, frames }
}

export const code = `function shortestSubarrayOr(nums, k) {
  let best = null
  for (let s = 0; s < nums.length; s++) {
    let or = 0
    for (let e = s; e < nums.length; e++) {
      or |= nums[e]
      if (or >= k) {
        const length = e - s + 1
        best = best === null ? length : Math.min(best, length)
        break
      }
    }
  }
  return best === null ? -1 : best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error('missing code line: ' + s); return i + 1 }

export const python = `def shortest_subarray_or(nums, k):
    best = None
    for s in range(len(nums)):
        acc = 0
        for e in range(s, len(nums)):
            acc |= nums[e]
            if acc >= k:
                length = e - s + 1
                if best is None or length < best:
                    best = length
                break
    return -1 if best is None else best
`
