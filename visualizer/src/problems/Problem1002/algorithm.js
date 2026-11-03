export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with no shared counts yet; the first word sets the initial limit for every letter.' },
  { id: 'inspect', label: 'Count word', description: 'Count how often each letter appears in the current word.' },
  { id: 'update', label: 'Keep minimum', description: 'For each letter, keep the smaller of the running count and this word count.' },
  { id: 'done', label: 'Complete', description: 'Expand every surviving count into repeated single-letter strings, in alphabetical order.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input) || input.length < 1 || input.length > 6) throw new Error('Use a JSON list of 1 to 6 words, such as ["cool", "loop"].')
  if (!input.every(w => typeof w === 'string' && /^[a-z]{1,10}$/.test(w))) throw new Error('Each word is 1 to 10 lowercase letters.')
  return input
}

const countOf = word => {
  const counts = new Map()
  for (const ch of word) counts.set(ch, (counts.get(ch) ?? 0) + 1)
  return counts
}

export function buildTrace(words) {
  let common = null
  const frames = [{ phase: 'start', activeLine: L('common = None'), pythonLine: P('common = None'), snapshot: { word: null, index: null, common: null }, message: `${words.length} words. Each letter's shared count can be no larger than its count in any single word.` }]
  words.forEach((word, index) => {
    const counts = countOf(word)
    frames.push({ phase: 'inspect', activeLine: L('count = Counter(word)'), pythonLine: P('count = Counter(word)'), snapshot: { word, index, counts: [...counts], common: common && [...common] }, message: `Word ${index + 1} "${word}" has ${counts.size} distinct letters.` })
    if (common === null) {
      common = counts
    } else {
      const next = new Map()
      for (const [ch, value] of common) {
        const kept = Math.min(value, counts.get(ch) ?? 0)
        if (kept > 0) next.set(ch, kept)
      }
      common = next
    }
    frames.push({ phase: 'update', activeLine: L('common = common & count'), pythonLine: P('common = common & count'), snapshot: { word, index, counts: [...counts], common: [...common] }, message: common.size ? `Shared counts now: ${[...common].map(([ch, v]) => `${ch}×${v}`).join(', ')}.` : 'No letter is shared by every word so far.' })
  })
  const result = [...(common ?? new Map())].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).flatMap(([ch, value]) => Array(value).fill(ch))
  frames.push({ phase: 'done', activeLine: L('return'), pythonLine: P('return'), snapshot: { word: null, index: null, common: [...(common ?? [])] }, message: result.length ? `Return [${result.map(ch => `"${ch}"`).join(', ')}].` : 'Return an empty list.' })
  return { input: words, result, frames }
}

export const code = `find common characters (words):
  common = None
  for each word:
    count = Counter(word)
    if common is None:
      common = count
    else:
      common = common & count
  result = []
  for each letter in sorted order of common:
    repeat the letter common[letter] times in result
  return result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `from collections import Counter

def common_chars(words):
    common = None
    for word in words:
        count = Counter(word)
        if common is None:
            common = count
        else:
            common = common & count
    result = []
    for letter in sorted(common):
        result.extend([letter] * common[letter])
    return result
`
