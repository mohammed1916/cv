export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use a JSON object with "nums" and "freq".')
  const { nums, freq } = data
  if (!Array.isArray(nums) || !Array.isArray(freq) || nums.length < 1 || nums.length > 10 || nums.length !== freq.length) throw new Error('"nums" and "freq" are arrays of the same length, 1 to 10.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 6)) throw new Error('IDs in "nums" are integers from 1 to 6.')
  if (freq.some(v => !Number.isInteger(v) || v === 0 || v < -5 || v > 5)) throw new Error('Each change in "freq" is a nonzero integer from -5 to 5.')
  const counts = new Map()
  freq.forEach((delta, i) => {
    const next = (counts.get(nums[i]) ?? 0) + delta
    if (next < 0) throw new Error(`Step ${i} removes more copies of ID ${nums[i]} than exist.`)
    if (next === 0) counts.delete(nums[i])
    else counts.set(nums[i], next)
  })
  return { nums, freq }
}

export function buildTrace({ nums, freq }) {
  const counts = new Map()
  const frames = [{ phase: 'start', activeLine: L('counts = empty map'), index: -1, before: {}, counts: {}, answer: [], best: 0, message: 'Start with no IDs in the collection.' }]
  const answer = []
  for (let i = 0; i < nums.length; i++) {
    const before = Object.fromEntries(counts)
    const next = (counts.get(nums[i]) ?? 0) + freq[i]
    if (next === 0) counts.delete(nums[i])
    else counts.set(nums[i], next)
    const best = counts.size ? Math.max(...counts.values()) : 0
    answer.push(best)
    frames.push({ phase: 'step', activeLine: next === 0 ? L('remove nums[i]') : L('counts[nums[i]] = counts'), index: i, before, counts: Object.fromEntries(counts), answer: [...answer], best, message: `Step ${i}: ID ${nums[i]} ${freq[i] > 0 ? 'gains' : 'loses'} ${Math.abs(freq[i])}. Most frequent count: ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return answer'), index: -1, before: {}, counts: Object.fromEntries(counts), answer: [...answer], best: answer[answer.length - 1], message: `Answer: [${answer.join(', ')}].` })
  return { input: { nums, freq }, result: answer, frames }
}

export const code = `most frequent ID count after each step
  counts = empty map
  answer = empty list
  for each step i
    counts[nums[i]] = counts[nums[i]] + freq[i]
    if counts[nums[i]] is 0 then
      remove nums[i] from counts
    add the largest value in counts to answer, or 0 if counts is empty
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import Counter

def most_frequent_ids(nums, freq):
    counts = Counter()
    answer = []
    for num, delta in zip(nums, freq):
        counts[num] += delta
        if counts[num] == 0:
            del counts[num]
        answer.append(max(counts.values(), default=0))
    return answer
`
