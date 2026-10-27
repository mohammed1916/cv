export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || typeof data.s !== 'string') throw new Error('Use an object with a string s, for example {"s":"bcbbbcba"}.')
  if (data.s.length < 1 || data.s.length > 30) throw new Error('s must have 1 to 30 characters.')
  if (!/^[a-z]+$/.test(data.s)) throw new Error('s may contain only lowercase English letters.')
  return { s: data.s }
}

const LIMIT = 2

export function buildTrace({ s }) {
  const frames = []
  const counts = new Map()
  let left = 0
  let best = 0
  const tally = () => Object.fromEntries([...counts].sort((a, b) => (a[0] < b[0] ? -1 : 1)))
  frames.push({ phase: 'start', activeLine: L('set counts to an empty tally'), left, right: -1, counts: {}, best, message: 'Start with an empty tally. No letter may appear more than twice in the window.' })
  for (let right = 0; right < s.length; right++) {
    const ch = s[right]
    counts.set(ch, (counts.get(ch) || 0) + 1)
    frames.push({ phase: 'extend', activeLine: L('add one to the tally'), left, right, counts: tally(), best, message: `Add ${ch} at index ${right}. It now appears ${counts.get(ch)} time${counts.get(ch) === 1 ? '' : 's'}.` })
    while (counts.get(ch) > LIMIT) {
      counts.set(s[left], counts.get(s[left]) - 1)
      left++
      frames.push({ phase: 'shrink', activeLine: L('remove one from the tally'), left, right, counts: tally(), best, message: `${ch} is now a third occurrence. Drop the left letter and move the left edge to ${left}.` })
    }
    best = Math.max(best, right - left + 1)
    frames.push({ phase: 'record', activeLine: L('set best to the larger'), left, right, counts: tally(), best, message: `Substring ${left} to ${right} is valid with length ${right - left + 1}. Best is ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), left, right: -1, counts: tally(), best, message: `Longest valid substring: ${best}.` })
  return { input: { s }, result: best, frames }
}

export const code = `maximum length substring with two occurrences (s)
  set counts to an empty tally, left to 0, and best to 0
  for each index right in s
    add one to the tally for the letter at right
    while the tally for the letter at right is more than 2
      remove one from the tally for the letter at left
      move left one step right
    set best to the larger of best and right minus left plus one
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
export const python = `def max_length_substring(s):
    counts = {}
    left = 0
    best = 0
    for right, ch in enumerate(s):
        counts[ch] = counts.get(ch, 0) + 1
        while counts[ch] > 2:
            counts[s[left]] -= 1
            left += 1
        best = max(best, right - left + 1)
    return best
`
