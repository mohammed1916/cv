export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Array.isArray(data.nums) || !Array.isArray(data.queries)) throw new Error('Use {"nums": [...], "queries": [[l, r, k], ...]}.')
  const { nums, queries } = data
  if (nums.length < 1 || nums.length > 8) throw new Error('nums must have 1 to 8 entries for the visualization.')
  if (nums.some((v, i) => !Number.isInteger(v) || v < 1 || v > 60 || (i > 0 && v <= nums[i - 1]))) throw new Error('nums must be strictly increasing integers from 1 to 60.')
  if (queries.length < 1 || queries.length > 6) throw new Error('Use 1 to 6 queries.')
  for (const q of queries) {
    if (!Array.isArray(q) || q.length !== 3) throw new Error('Each query is [l, r, k].')
    const [l, r, k] = q
    if (!Number.isInteger(l) || !Number.isInteger(r) || l < 0 || r < l || r >= nums.length) throw new Error('Need 0 <= l <= r < nums.length.')
    if (!Number.isInteger(k) || k < 1 || k > 20) throw new Error('k is an integer from 1 to 20.')
  }
  return { nums, queries }
}

export function buildTrace(input) {
  const { nums, queries } = input
  const answers = []
  const frames = [{ phase: 'start', activeLine: L('create an empty answer list'), index: -1, value: null, answers: [], message: 'Each query removes the evens found in its subarray, then asks for the k-th even left.' }]
  queries.forEach(([l, r, k], q) => {
    let value = 2 * k
    frames.push({ phase: 'query', activeLine: L('let value be'), index: l, value, answers: [...answers], message: `Query ${q + 1}: subarray ${l}..${r}, k = ${k}. Without removals the answer is ${value}.` })
    for (let i = l; i <= r; i++) {
      const x = nums[i]
      if (x % 2 === 0 && x <= value) {
        value += 2
        frames.push({ phase: 'shift', activeLine: L('add 2 to value'), index: i, value, answers: [...answers], message: `${x} is an even that was removed and is at most the running answer, so move to ${value}.` })
      } else {
        frames.push({ phase: 'scan', activeLine: L('for each number x'), index: i, value, answers: [...answers], message: x % 2 === 0 ? `${x} is removed but lies above the running answer, so it changes nothing.` : `${x} is odd, so it removes nothing.` })
      }
    }
    answers.push(value)
    frames.push({ phase: 'append', activeLine: L('append value'), index: -1, value, answers: [...answers], message: `Answer ${q + 1} is ${value}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return the answer list'), index: -1, value: null, answers: [...answers], message: `Answers: [${answers.join(', ')}].` })
  return { input, result: answers, frames }
}

export const code = `k-th smallest remaining even integer for each query
  create an empty answer list
  for each query (l, r, k) in order
    let value be 2 times k
    for each number x in nums from index l to r
      if x is even and x is at most value then
        add 2 to value
    append value to the answer list
  return the answer list`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def kth_smallest_remaining_even(nums, queries):
    answers = []
    for l, r, k in queries:
        value = 2 * k
        for x in nums[l:r + 1]:
            if x % 2 == 0 and x <= value:
                value += 2
        answers.append(value)
    return answers
`
