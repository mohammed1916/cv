const WORDS = /^[A-Za-z]+( [A-Za-z]+)*$/

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with sentence.')
  const { sentence } = input
  if (typeof sentence !== 'string' || sentence.length > 200 || !WORDS.test(sentence)) throw new Error('sentence is words of letters separated by single spaces.')
  return { sentence }
}

export function buildTrace({ sentence }) {
  const words = sentence.split(' ')
  const frames = []
  frames.push({ pythonLine: PL('words = sentence.split'), phase: 'setup', activeLine: CL('const words ='), at: -1, words, next: null, result: null, message: `Split into ${words.length} word${words.length === 1 ? '' : 's'}.` })
  let result = true
  for (let i = 0; i < words.length; i++) {
    const next = (i + 1) % words.length
    const end = words[i][words[i].length - 1]
    const start = words[next][0]
    frames.push({ pythonLine: PL('if words[i][-1]'), phase: 'compare', activeLine: CL('if (end !== start)'), at: i, next, words, result: null, message: `${words[i]} ends with ${end}; ${words[next]} starts with ${start}.` })
    if (end !== start) {
      result = false
      frames.push({ pythonLine: PL('return False'), phase: 'fail', activeLine: CL('return false'), at: i, next, words, result: false, message: 'The letters do not match, so the sentence is not circular.' })
      break
    }
  }
  if (result) frames.push({ pythonLine: PL('return True'), phase: 'done', activeLine: CL('return true'), at: -1, next: null, words, result: true, message: 'Every link matches, including the wrap-around.' })
  return { input: { sentence }, result, frames }
}

export const code = `function isCircularSentence(sentence) {
  const words = sentence.split(' ');
  for (let i = 0; i < words.length; i++) {
    const next = (i + 1) % words.length;
    const end = words[i][words[i].length - 1];
    const start = words[next][0];
    if (end !== start) return false;
  }
  return true;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def is_circular_sentence(sentence):
    words = sentence.split(" ")
    for i in range(len(words)):
        next_word = words[(i + 1) % len(words)]
        if words[i][-1] != next_word[0]:
            return False
    return True
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
