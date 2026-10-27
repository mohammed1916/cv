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
  const frame = (phase, line, start, end, or, message) => frames.push({ phase, activeLine: line, start, end, or, best, message })
  frame('start', L('set best to nothing'), -1, -1, 0, 'No subarray has been checked yet.')
  for (let s = 0; s < nums.length; s++) {
    let or = 0
    frame('start-index', L('set or value to 0'), s, s - 1, or, `Grow subarrays that start at ${s}.`)
    for (let e = s; e < nums.length; e++) {
      or |= nums[e]
      frame('extend', L('set or value to'), s, e, or, `Subarray ${s}-${e} has OR ${or}.`)
      if (or >= k) {
        const length = e - s + 1
        best = best === null ? length : Math.min(best, length)
        frame('hit', L('set best to the smaller'), s, e, or, `OR ${or} reaches ${k}; length ${length}.`)
        break
      }
    }
  }
  frame('done', L('return best, or -1'), -1, -1, 0, best === null ? 'No subarray reaches k.' : `Shortest length: ${best}.`)
  return { input: { nums, k }, result: best === null ? -1 : best, frames }
}

export const code = `shortest subarray whose OR is at least k
  set best to nothing
  for each start index s from 0 to the last index do
    set or value to 0
    for each end index e from s to the last index do
      set or value to or value OR nums[e]
      if or value is at least k then
        set best to the smaller of best and e minus s plus 1
        stop the inner loop
  return best, or -1 if best is nothing`.split('\n').map((text, index) => ({ line: index + 1, text }))
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
