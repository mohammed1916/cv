export const phases = [
  { id: 'start', label: 'Start', description: 'Split the sentence into words, keeping their original order.' },
  { id: 'inspect', label: 'Compare prefix', description: 'Check whether the current word begins with the search word.' },
  { id: 'update', label: 'Record match', description: 'The first word that begins with the search word fixes the one-based position.' },
  { id: 'done', label: 'Complete', description: 'Return the position, or -1 when no word begins with the search word.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"sentence": "...", "searchWord": "..."}.')
  const { sentence, searchWord } = input
  if (typeof sentence !== 'string' || sentence.length > 100 || !/^[a-z]+( [a-z]+)*$/.test(sentence)) throw new Error('sentence is up to 100 lowercase letters with single spaces between words.')
  if (typeof searchWord !== 'string' || !/^[a-z]{1,10}$/.test(searchWord)) throw new Error('searchWord is 1 to 10 lowercase letters.')
  return { sentence, searchWord }
}

export function buildTrace({ sentence, searchWord }) {
  const words = sentence.split(' ')
  const matches = []
  const snap = (index, answer) => ({ words, index, searchWord, matches: [...matches], answer })
  const frames = [{ phase: 'start', activeLine: L('words = sentence.split'), pythonLine: P('words = sentence.split'), snapshot: snap(null, null), message: `Split into ${words.length} words. Scan left to right and stop at the first word that starts with "${searchWord}".` }]
  let answer = null
  for (let i = 0; i < words.length; i++) {
    const hit = words[i].startsWith(searchWord)
    frames.push({ phase: 'inspect', activeLine: L('if words[index]'), pythonLine: P('if word.startswith'), snapshot: snap(i, null), message: `Word ${i + 1} is "${words[i]}". ${hit ? `Its first ${searchWord.length} letters match.` : `Its first ${searchWord.length} letters differ, so keep scanning.`}` })
    if (hit) {
      answer = i + 1
      matches.push(i)
      frames.push({ phase: 'update', activeLine: L('return index + 1'), pythonLine: P('return index + 1'), snapshot: snap(i, answer), message: `Word ${answer} is the first match, so its one-based position ${answer} is the answer.` })
      break
    }
  }
  frames.push({ phase: 'done', activeLine: answer ? L('return index + 1') : L('return -1'), pythonLine: answer ? P('return index + 1') : P('return -1'), snapshot: snap(null, answer ?? -1), message: answer ? `Return ${answer}.` : 'No word begins with the search word, so return -1.' })
  return { input: { sentence, searchWord }, result: answer ?? -1, frames }
}

export const code = `first prefix word (sentence, searchWord):
  words = sentence.split(' ')
  for index from 0 to len(words) - 1:
    if words[index] starts with searchWord:
      return index + 1
  return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def first_prefix_word(sentence, searchWord):
    words = sentence.split(" ")
    for index, word in enumerate(words):
        if word.startswith(searchWord):
            return index + 1
    return -1
`
