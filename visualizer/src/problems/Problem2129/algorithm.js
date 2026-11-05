// LeetCode 2129: Capitalize the Title.
// Words of length 1 or 2 become lowercase. Longer words get an uppercase first letter and lowercase rest.

export function parseInput(text) {
  const title = text.trim()
  if (title.length < 1 || title.length > 100 || !/^[A-Za-z]+( [A-Za-z]+)*$/.test(title)) {
    throw new Error('Use words of English letters separated by single spaces (at most 100 characters).')
  }
  return { title }
}

export const code = `function capitalizeTitle(title) {
  return title
    .split(' ')
    .map(word => (word.length <= 2
      ? word.toLowerCase()
      : word[0].toUpperCase() + word.slice(1).toLowerCase()))
    .join(' ')
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: capitalize_title
def capitalize_title(title):
    result = []
    for word in title.split(" "):
        if len(word) <= 2:
            result.append(word.lower())
        else:
            result.append(word[0].upper() + word[1:].lower())
    return " ".join(result)
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
  { id: 'split', label: 'Split', description: 'Each space-separated word is handled on its own.' },
  { id: 'short', label: 'Short word', description: 'A word of 1 or 2 letters is all lowercase.' },
  { id: 'long', label: 'Long word', description: 'A longer word starts with a capital, the rest lowercase.' },
  { id: 'done', label: 'Result', description: 'The rebuilt title.' },
]

export function buildTrace({ title }) {
  const frames = []
  const rows = []
  const outputs = []
  title.split(' ').forEach((word, i) => {
    const short = word.length <= 2
    const result = short ? word.toLowerCase() : word[0].toUpperCase() + word.slice(1).toLowerCase()
    outputs.push(result)
    rows.push({ word, length: word.length, rule: short ? 'all lowercase' : 'capital first', result })
    frames.push({ phase: short ? 'short' : 'long', activeLine: L(short ? 'word.toLowerCase()' : 'word[0].toUpperCase()'), pythonLine: P(short ? 'result.append(word.lower())' : 'word[0].upper()'), message: `"${word}" becomes "${result}" (${short ? 'short word' : 'longer word'}).`, rows: [...rows], i, built: outputs.join(' ') })
  })
  const result = outputs.join(' ')
  frames.push({ phase: 'done', activeLine: L('.join'), pythonLine: P('return " ".join'), message: `Result: "${result}".`, rows: [...rows], i: -1, built: result })
  return { input: { title }, result, frames }
}
