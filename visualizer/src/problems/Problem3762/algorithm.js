export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums, k and queries.')
  const { nums, k, queries } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 10 || !nums.every(x => Number.isInteger(x) && x >= 1 && x <= 30)) {
    throw new Error('nums has 1 to 10 integers from 1 to 30.')
  }
  if (!Number.isInteger(k) || k < 1 || k > 10) throw new Error('k is an integer from 1 to 10.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 6) throw new Error('queries has 1 to 6 pairs.')
  for (const q of queries) {
    if (!Array.isArray(q) || q.length !== 2 || !q.every(Number.isInteger) || q[0] < 0 || q[0] > q[1] || q[1] >= nums.length) {
      throw new Error(`Each query needs 0 <= l <= r < ${nums.length}.`)
    }
  }
  return { nums, k, queries }
}

const frame = o => ({ at: -1, span: null, level: null, mid: null, answer: null, ...o })

export function buildTrace({ nums, k, queries }) {
  const frames = []
  const answers = []
  queries.forEach(([l, r], qi) => {
    const piece = nums.slice(l, r + 1)
    frames.push(frame({ span: [l, r], phase: 'window', pythonLine: Y('piece = nums'), activeLine: L('take the piece'), message: `Query ${qi + 1}: indices ${l} to ${r}.` }))
    const residue = piece[0] % k
    const bad = piece.findIndex(x => x % k !== residue)
    if (bad >= 0) {
      answers.push(-1)
      frames.push(frame({ at: l + bad, span: [l, r], phase: 'mismatch', pythonLine: Y('answers.append(-1)'), activeLine: L('append -1'), answer: -1, message: `${piece[bad]} has a different remainder mod ${k}, so no operation sequence works. Answer -1.` }))
      return
    }
    const levels = piece.map(x => Math.floor(x / k)).sort((a, b) => a - b)
    const mid = levels[Math.floor(levels.length / 2)]
    const cost = levels.reduce((sum, v) => sum + Math.abs(v - mid), 0)
    answers.push(cost)
    frames.push(frame({ span: [l, r], level: levels, mid, answer: cost, phase: 'median', pythonLine: Y('mid = levels'), activeLine: L('take the median'), message: `Levels ${levels.join(', ')}; target level ${mid}; cost ${cost}.` }))
  })
  frames.push(frame({ phase: 'done', pythonLine: Y('return answers'), activeLine: L('return answers'), answer: answers[answers.length - 1], message: 'Every query has its answer.' }))
  return { input: { nums, k, queries }, result: answers, frames }
}

export const code = `answer each query with the fewest steps that equalize its piece
  answers starts as an empty list
  for each query [l, r]
    take the piece nums[l..r]
    if the remainders mod k differ then append -1 and move on
    otherwise divide each value by k and sort the levels
    take the median level as the target
    the cost is the sum of distances from the median
  return answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def equalize_subarrays(nums, k, queries):
    answers = []
    for l, r in queries:
        piece = nums[l:r + 1]
        if any(x % k != piece[0] % k for x in piece):
            answers.append(-1)
            continue
        levels = sorted(x // k for x in piece)
        mid = levels[len(levels) // 2]
        answers.append(sum(abs(v - mid) for v in levels))
    return answers
`
const Y = s => python.split('\n').findIndex(line => line.includes(s)) + 1
