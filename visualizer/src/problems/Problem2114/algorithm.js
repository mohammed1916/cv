// LeetCode 2114: Maximum Number of Words Found in Sentences.
// Words in a sentence are separated by single spaces, so words = spaces + 1. Keep the largest count.

export function parseInput(text) {
  let sentences
  try { sentences = JSON.parse(text) } catch { throw new Error('Use a JSON array of sentences, e.g. ["alpha beta","gamma"].') }
  if (!Array.isArray(sentences) || sentences.length < 1 || sentences.length > 12) throw new Error('Use 1 to 12 sentences.')
  for (const sentence of sentences) {
    if (typeof sentence !== 'string' || !/^[a-z]+( [a-z]+)*$/.test(sentence) || sentence.length > 40) {
      throw new Error('Each sentence is lowercase words separated by single spaces (at most 40 characters).')
    }
  }
  return { sentences }
}

export const code = `function maxWords(sentences) {
  let best = 0
  for (const sentence of sentences) {
    const words = sentence.split(' ').length
    best = Math.max(best, words)
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: max_words
def max_words(sentences):
    best = 0
    for sentence in sentences:
        words = len(sentence.split(" "))
        best = max(best, words)
    return best
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'count', label: 'Count words', description: 'Words in a sentence are one more than its spaces.' },
  { id: 'best', label: 'Keep the largest', description: 'The sentence with the most words so far.' },
  { id: 'done', label: 'Result', description: 'The largest word count.' },
]

export function buildTrace({ sentences }) {
  const frames = []
  let best = 0
  let bestAt = -1
  const counts = []
  sentences.forEach((sentence, i) => {
    const words = sentence.split(' ').length
    counts.push(words)
    frames.push({ phase: 'count', activeLine: L('const words'), pythonLine: P('words = len'), message: `"${sentence}" has ${words} words.`, i, counts: [...counts], best, bestAt })
    if (words > best) { best = words; bestAt = i }
    frames.push({ phase: 'best', activeLine: L('best = Math.max'), pythonLine: P('best = max'), message: `Largest so far: ${best} words.`, i, counts: [...counts], best, bestAt })
  })
  frames.push({ phase: 'done', activeLine: L('return best'), pythonLine: P('return best'), message: `The most words in one sentence is ${best}.`, i: -1, counts: [...counts], best, bestAt })
  return { input: { sentences }, result: best, frames }
}
