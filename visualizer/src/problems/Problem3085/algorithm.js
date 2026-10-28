export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use a JSON object with "word" and "k".')
  const { word, k } = data
  if (typeof word !== 'string' || word.length < 1 || word.length > 20) throw new Error('"word" is a string of 1 to 20 characters.')
  if (!/^[a-z]+$/.test(word)) throw new Error('"word" uses lowercase letters a to z only.')
  if (!Number.isInteger(k) || k < 0 || k > 5) throw new Error('"k" is an integer from 0 to 5.')
  return { word, k }
}

export function buildTrace({ word, k }) {
  const counts = new Map()
  for (const ch of word) counts.set(ch, (counts.get(ch) ?? 0) + 1)
  const top = Math.max(...counts.values())
  const before = Object.fromEntries(counts)
  const frames = [{ phase: 'count', activeLine: L('count how often'), low: null, before, after: before, best: word.length, message: `Count the letters. The largest count is ${top}.` }]
  let best = word.length
  for (let low = 1; low <= top; low++) {
    let cost = 0
    const after = {}
    for (const [ch, c] of counts) {
      if (c < low) {
        cost += c
        after[ch] = 0
      } else if (c > low + k) {
        cost += c - (low + k)
        after[ch] = low + k
      } else {
        after[ch] = c
      }
    }
    best = Math.min(best, cost)
    frames.push({ phase: 'target', activeLine: L('best = smaller'), low, before, after, best, message: `Target lowest count ${low}: every kept letter must fall between ${low} and ${low + k}. This costs ${cost} deletions.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), low: null, before, after: before, best, message: `Fewest deletions: ${best}.` })
  return { input: { word, k }, result: best, frames }
}

export const code = `fewest deletions to make the word k-special
  count how often each letter appears
  best = length of word
  for each target low from 1 to the largest count
    cost = 0
    for each letter count c
      if c < low then
        cost = cost + c
      otherwise if c > low + k then
        cost = cost + c - (low + k)
    best = smaller of best and cost
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import Counter

def minimum_deletions(word, k):
    counts = list(Counter(word).values())
    best = len(word)
    for low in range(1, max(counts) + 1):
        cost = 0
        for c in counts:
            if c < low:
                cost += c
            elif c > low + k:
                cost += c - (low + k)
        best = min(best, cost)
    return best
`
