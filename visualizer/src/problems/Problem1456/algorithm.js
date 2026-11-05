const VOWELS = 'aeiou'

export const phases = [
  { id: 'start', label: 'First window', description: 'Count the vowels in the first window of length k.' },
  { id: 'update', label: 'Slide window', description: 'Add the entering character and remove the leaving character, keeping the count current.' },
  { id: 'inspect', label: 'Compare best', description: 'Keep the largest count seen among completed windows.' },
  { id: 'done', label: 'Complete', description: 'Return the greatest vowel count among all windows of length k.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"text": "...", "k": 3}.')
  const { text: value, k } = input
  if (typeof value !== 'string' || value.length < 1 || value.length > 200 || !/^[a-z]+$/.test(value)) throw new Error('text is 1 to 200 lowercase letters.')
  if (!Number.isInteger(k) || k < 1 || k > value.length) throw new Error('k is an integer from 1 to the length of text.')
  return { text: value, k }
}

const isVowel = ch => VOWELS.includes(ch)

export function buildTrace({ text, k }) {
  const frames = []
  const snap = (start, count, best, bestStart, entering = null, leaving = null) => ({ text, k, start, count, best, bestStart, entering, leaving })
  let count = 0
  for (let i = 0; i < k; i++) if (isVowel(text[i])) count++
  let best = count
  let bestStart = 0
  frames.push({ phase: 'start', activeLine: L('let count = 0'), pythonLine: P('count = sum'), snapshot: snap(0, count, best, bestStart), message: `The first window covers positions 0 to ${k - 1} and holds ${count} vowel${count === 1 ? '' : 's'}. This is the best so far.` })
  for (let end = k; end < text.length; end++) {
    const start = end - k + 1
    const entering = text[end]
    const leaving = text[end - k]
    if (isVowel(entering)) count += 1
    if (isVowel(leaving)) count -= 1
    frames.push({ phase: 'update', activeLine: L('vowels.has(s[end])'), pythonLine: P('if text[end] in vowels'), snapshot: snap(start, count, best, bestStart, end, end - k), message: `Slide right: "${entering}" enters at ${end}, "${leaving}" leaves at ${end - k}. The window starting at ${start} now holds ${count} vowel${count === 1 ? '' : 's'}.` })
    if (count > best) {
      best = count
      bestStart = start
      frames.push({ phase: 'inspect', activeLine: L('best = Math.max'), pythonLine: P('best = max'), snapshot: snap(start, count, best, bestStart, end, end - k), message: `${count} beats the previous best, so the window starting at ${start} is now the best.` })
    } else {
      frames.push({ phase: 'inspect', activeLine: L('best = Math.max'), pythonLine: P('best = max'), snapshot: snap(start, count, best, bestStart, end, end - k), message: `${count} does not beat the best of ${best}, which stays unchanged.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), pythonLine: P('return best'), snapshot: snap(null, null, best, bestStart), message: `Return ${best}, the greatest vowel count in a window of length ${k}.` })
  return { input: { text, k }, result: best, frames }
}

export const code = `function maxVowels(s, k) {
  const vowels = new Set('aeiou')
  let count = 0
  for (let i = 0; i < k; i++) if (vowels.has(s[i])) count += 1
  let best = count
  for (let end = k; end < s.length; end++) {
    if (vowels.has(s[end])) count += 1
    if (vowels.has(s[end - k])) count -= 1
    best = Math.max(best, count)
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def max_vowels(text, k):
    vowels = set("aeiou")
    count = sum(ch in vowels for ch in text[:k])
    best = count
    for end in range(k, len(text)):
        if text[end] in vowels:
            count += 1
        if text[end - k] in vowels:
            count -= 1
        best = max(best, count)
    return best
`
