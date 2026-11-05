export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums) || !Array.isArray(input.queries)) throw new Error('Use an object with nums and queries.')
  const { nums, queries } = input
  if (nums.length < 1 || nums.length > 12 || !nums.every(x => Number.isInteger(x) && x >= 1 && x <= 9)) throw new Error('nums has 1 to 12 integers from 1 to 9.')
  if (queries.length < 1 || queries.length > 6) throw new Error('Use 1 to 6 queries.')
  for (const q of queries) {
    if (!Array.isArray(q) || q.length !== 2 || !Number.isInteger(q[0]) || !Number.isInteger(q[1]) || q[0] < 0 || q[1] >= nums.length || q[0] > q[1]) throw new Error('Each query is [l, r] with 0 <= l <= r < nums.length.')
  }
  return { nums, queries }
}

export function buildTrace({ nums, queries }) {
  const frames = []
  const answers = []
  for (const [l, r] of queries) {
    let total = 0
    let run = 0
    frames.push({ pythonLine: P('for l, r in queries'), phase: 'query', activeLine: L('for (const [l, r]'), at: -1, l, r, run, total, answers: [...answers], message: `Query [${l}, ${r}]: count stable subarrays inside it.` })
    for (let i = l; i <= r; i++) {
      if (i > l && nums[i - 1] > nums[i]) {
        run = 0
        frames.push({ pythonLine: P('nums[i - 1] > nums[i]'), phase: 'break', activeLine: L('run = 0'), at: i, l, r, run, total, answers: [...answers], message: `${nums[i - 1]} > ${nums[i]} is an inversion; stable runs restart at index ${i}.` })
      }
      run += 1
      total += run
      frames.push({ pythonLine: P('total += run'), phase: 'extend', activeLine: L('total += run'), at: i, l, r, run, total, answers: [...answers],
        message: `Subarrays ending at index ${i}: ${run}; running total ${total}.` })
    }
    answers.push(total)
    frames.push({ pythonLine: P('answers.append'), phase: 'answer', activeLine: L('answers.push'), at: -1, l, r, run, total, answers: [...answers], message: `Answer for [${l}, ${r}] is ${total}.` })
  }
  frames.push({ pythonLine: P('return answers'), phase: 'done', activeLine: L('return answers'), at: -1, l: null, r: null, run: 0, total: 0, answers: [...answers], message: 'All queries are answered.' })
  return { input: { nums, queries }, result: answers, frames }
}

export const code = `function countStableSubarrays(nums, queries) {
  const answers = []
  for (const [l, r] of queries) {
    let total = 0
    let run = 0
    for (let i = l; i <= r; i++) {
      if (i > l && nums[i - 1] > nums[i]) run = 0
      run += 1
      total += run
    }
    answers.push(total)
  }
  return answers
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

export const python = `def count_stable(nums, queries):
    answers = []
    for l, r in queries:
        total = 0
        run = 0
        for i in range(l, r + 1):
            if i > l and nums[i - 1] > nums[i]:
                run = 0
            run += 1
            total += run
        answers.append(total)
    return answers
`
