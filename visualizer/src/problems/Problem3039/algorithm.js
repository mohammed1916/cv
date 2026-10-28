export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 20) throw new Error('Use a JSON string of 1 to 20 characters.')
  if (!/^[a-z]+$/.test(s)) throw new Error('Use lowercase letters a to z only.')
  return s
}

export function buildTrace(s) {
  const counts = new Map()
  for (const ch of s) counts.set(ch, (counts.get(ch) ?? 0) + 1)
  const top = Math.max(...counts.values())
  const last = new Map()
  for (let i = 0; i < s.length; i++) last.set(s[i], i)
  const frames = [{ phase: 'count', activeLine: L('count how often'), index: -1, kept: '', message: `Count the letters. The largest count is ${top}.` }]
  let kept = ''
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    const keep = counts.get(ch) === top && last.get(ch) === i
    if (keep) kept += ch
    frames.push({ phase: keep ? 'keep' : 'skip', activeLine: keep ? L('append s[i]') : L('for each position'), index: i, kept, message: keep ? `Keep ${ch} at position ${i}: it is the last copy of a letter that appears ${top} times.` : `Skip ${ch} at position ${i}: it is not the last copy of a letter that appears ${top} times.` })
  }
  frames.push({ phase: 'done', activeLine: L('return result'), index: -1, kept, message: `String just before the last round: ${kept}.` })
  return { input: s, result: kept, frames }
}

export const code = `string just before the last round
  count how often each letter appears
  top = largest count
  last = position of the last occurrence of each letter
  result = empty
  for each position i in s from left to right
    if the count of s[i] equals top and i is last[s[i]] then
      append s[i] to result
  return result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import Counter

def last_round_string(s):
    counts = Counter(s)
    top = max(counts.values())
    last = {}
    for i, ch in enumerate(s):
        last[ch] = i
    return ''.join(ch for i, ch in enumerate(s) if counts[ch] == top and last[ch] == i)
`
