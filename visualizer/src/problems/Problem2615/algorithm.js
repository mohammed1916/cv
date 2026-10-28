export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums) || input.nums.length < 1 || input.nums.length > 12) throw new Error('Use an object with nums: an array of 1 to 12 integers.')
  if (input.nums.some(v => !Number.isInteger(v) || v < 0 || v > 5)) throw new Error('Each nums entry is an integer from 0 to 5.')
  return { nums: input.nums }
}

export function buildTrace(input) {
  const nums = input.nums
  const n = nums.length
  const groups = new Map()
  nums.forEach((value, i) => {
    if (!groups.has(value)) groups.set(value, [])
    groups.get(value).push(i)
  })
  const answer = new Array(n).fill(0)
  const frames = [{ phase: 'start', activeLine: L('group the indices'), index: -1, answer: [...answer], group: [], message: `The numbers form ${groups.size} groups of equal values.` }]
  for (const [value, idx] of groups) {
    const total = idx.reduce((sum, p) => sum + p, 0)
    let before = 0
    idx.forEach((p, t) => {
      const after = total - before - p
      answer[p] = p * t - before + after - p * (idx.length - t - 1)
      frames.push({ phase: 'group', activeLine: L('set answer[p]'), index: p, answer: [...answer], group: [...idx], value, message: `Index ${p} shares value ${value} with ${idx.length - 1} other index(es). Distance total ${answer[p]}.` })
      before += p
    })
  }
  frames.push({ phase: 'done', activeLine: L('return answer'), index: n, answer: [...answer], group: [], message: `Answer: ${answer.join(', ')}.` })
  return { input, result: answer, frames }
}

export const code = `sum of distances to indices with equal values
  group the indices of nums by value, in increasing order
  set answer to n zeros
  for each group idx of indices do
    set total to the sum of idx and before to 0
    for each position t in idx with index p do
      set after to total minus before minus p
      set answer[p] to p times t minus before, plus after, minus p times the members after p
      add p to before
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def sum_of_distances(nums):
    groups = {}
    for i, value in enumerate(nums):
        groups.setdefault(value, []).append(i)
    answer = [0] * len(nums)
    for idx in groups.values():
        total = sum(idx)
        before = 0
        m = len(idx)
        for t, p in enumerate(idx):
            after = total - before - p
            answer[p] = p * t - before + after - p * (m - t - 1)
            before += p
    return answer
`
