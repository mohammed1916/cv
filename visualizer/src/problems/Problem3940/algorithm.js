export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Array.isArray(data.nums) || !Number.isInteger(data.k)) throw new Error('Use {"nums": [...], "k": k} with a sorted array.')
  const { nums, k } = data
  if (nums.length < 1 || nums.length > 10) throw new Error('nums must have 1 to 10 entries for the visualization.')
  if (nums.some((v, i) => !Number.isInteger(v) || v < 1 || v > 10 || (i > 0 && v < nums[i - 1]))) throw new Error('nums must be sorted non-decreasing integers from 1 to 10.')
  if (k < 1 || k > nums.length) throw new Error('k is an integer from 1 to nums.length.')
  return { nums, k }
}

export function buildTrace(input) {
  const { nums, k } = input
  const answer = []
  const seen = new Map()
  const frames = [{ phase: 'start', activeLine: L('let answer be'), index: -1, answer: [], seen: 0, message: `Keep at most ${k} copies of each value.` }]
  nums.forEach((x, i) => {
    const before = seen.get(x) ?? 0
    if (before < k) {
      answer.push(x)
      frames.push({ phase: 'keep', activeLine: L('append x to answer'), index: i, answer: [...answer], seen: before + 1, message: `${x} has been kept ${before} time(s) so far, so keep it.` })
    } else {
      frames.push({ phase: 'drop', activeLine: L('if seen count of x'), index: i, answer: [...answer], seen: before, message: `${x} already has ${k} copies, so drop it.` })
    }
    seen.set(x, before + 1)
  })
  frames.push({ phase: 'done', activeLine: L('return answer'), index: -1, answer: [...answer], seen: 0, message: `Answer: [${answer.join(', ')}].` })
  return { input, result: answer, frames }
}

export const code = `keep at most k copies of each value in order
  let answer be an empty list
  let seen be an empty table of counts
  for each value x in nums in order
    if seen count of x is less than k then
      append x to answer
    add 1 to the seen count of x
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def limit_occurrences(nums, k):
    answer = []
    seen = {}
    for x in nums:
        if seen.get(x, 0) < k:
            answer.append(x)
        seen[x] = seen.get(x, 0) + 1
    return answer
`
