export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 20) throw new Error('Use a JSON array of 1 to 20 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 0 || v > 100)) throw new Error('Values are integers from 0 to 100.')
  return nums
}

export function buildTrace(nums) {
  const counts = new Map()
  const frames = [{ phase: 'start', activeLine: L('counts = empty map'), value: null, counts: {}, best: -1, message: 'Count only the even values.' }]
  for (const v of nums) {
    if (v % 2 !== 0) continue
    counts.set(v, (counts.get(v) ?? 0) + 1)
    frames.push({ phase: 'count', activeLine: L('counts[v] = counts[v] + 1'), value: v, counts: Object.fromEntries(counts), best: -1, message: `Even value ${v} now appears ${counts.get(v)} time${counts.get(v) === 1 ? '' : 's'}.` })
  }
  let best = -1
  for (const v of counts.keys()) {
    const better = best === -1 || counts.get(v) > counts.get(best) || (counts.get(v) === counts.get(best) && v < best)
    if (better) {
      best = v
      frames.push({ phase: 'best', activeLine: L('best = v'), value: v, counts: Object.fromEntries(counts), best, message: `${v} is now the best candidate with ${counts.get(v)} occurrences.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), value: null, counts: Object.fromEntries(counts), best, message: best === -1 ? 'There are no even values, so the answer is -1.' : `Most frequent even value: ${best}.` })
  return { input: nums, result: best, frames }
}

export const code = `most frequent even element
  counts = empty map
  for each value v in nums
    if v is even then
      counts[v] = counts[v] + 1
  best = -1
  for each value v in counts
    if best is -1, or counts[v] is larger than counts[best], or they are equal and v is smaller than best then
      best = v
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import Counter

def most_frequent_even(nums):
    counts = Counter(v for v in nums if v % 2 == 0)
    best = -1
    for v in counts:
        if best == -1 or counts[v] > counts[best] or (counts[v] == counts[best] and v < best):
            best = v
    return best
`
