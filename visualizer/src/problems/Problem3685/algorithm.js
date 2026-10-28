export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 20) throw new Error('nums must be an array of 1 to 20 positive integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 1000000000)) throw new Error('Each nums value must be an integer from 1 to 1000000000.')
  if (!Number.isInteger(k) || k < 1 || k > 200) throw new Error('k must be an integer from 1 to 200 in this visualization.')
  return { nums, k }
}

export function buildTrace(input) {
  const { nums, k } = input
  const answers = []
  const frames = [{ phase: 'start', activeLine: L('set answers to an empty list'), cap: 0, answer: null, message: `Try caps 1 to ${nums.length}. For each cap, check whether a subsequence sums to ${k}.` }]
  for (let x = 1; x <= nums.length; x++) {
    const reachable = new Array(k + 1).fill(false)
    reachable[0] = true
    for (const v of nums) {
      const c = Math.min(v, x)
      for (let s = k; s >= c; s--) if (reachable[s - c]) reachable[s] = true
    }
    answers.push(reachable[k])
    frames.push({ phase: 'cap', activeLine: L('for each cap x'), cap: x, answer: reachable[k], message: `Cap ${x}: a subsequence sums to ${k}? ${reachable[k] ? 'yes' : 'no'}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return answers'), cap: nums.length, answer: null, message: `Answers: [${answers.join(', ')}].` })
  return { input: { nums, k }, result: answers, frames }
}

export const code = `subsequence sums after capping (nums, k):
  set answers to an empty list
  for each cap x from 1 to the length of nums do
    set reachable to true for sum 0 only
    for each value v in nums do
      let c be the smaller of v and x
      for each sum s from k down to c do
        if reachable[s - c] then set reachable[s] to true
    add reachable[k] to answers
  return answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def capped_subset_sums(nums, k):
    answers = []
    for x in range(1, len(nums) + 1):
        reachable = [False] * (k + 1)
        reachable[0] = True
        for v in nums:
            c = min(v, x)
            for s in range(k, c - 1, -1):
                if reachable[s - c]:
                    reachable[s] = True
        answers.append(reachable[k])
    return answers
`
