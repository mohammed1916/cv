export function parseInput(text) {
  const data = JSON.parse(text)
  const { dictionary, sentence } = data ?? {}
  if (!Array.isArray(dictionary) || dictionary.length < 1 || dictionary.length > 1000 || dictionary.some(w => typeof w !== 'string' || !/^[a-z]{1,100}$/.test(w))) throw new Error('dictionary must hold 1–1,000 lowercase words.')
  if (typeof sentence !== 'string' || !/^[a-z]+( [a-z]+)*$/.test(sentence) || sentence.length > 1000) throw new Error('sentence must be lowercase words separated by single spaces.')
  return { dictionary, sentence }
}

// Each word takes its shortest dictionary root as a prefix; a word with no root stays unchanged.
export function buildTrace({ dictionary, sentence }) {
  const roots = new Set(dictionary)
  const words = sentence.split(' ')
  const output = []
  const frames = [{ phase: 'start', word: null, prefixes: [], replacement: null, output: [...output], activeLine: L('const roots = new Set'), pythonLine: P('roots = set('), message: 'Put every root in a set for quick lookup.' }]
  for (const word of words) {
    let replacement = word
    const prefixes = []
    for (let end = 1; end <= word.length; end++) {
      const prefix = word.slice(0, end)
      const isRoot = roots.has(prefix)
      prefixes.push({ prefix, isRoot })
      frames.push({ phase: 'prefix', word, prefixes: [...prefixes], replacement: null, output: [...output], activeLine: L('if (roots.has(prefix))'), pythonLine: P('if word[:end] in roots'), message: `${word}: prefix ${prefix} ${isRoot ? 'is a root, so use it' : 'is not a root'}.` })
      if (isRoot) { replacement = prefix; break }
    }
    output.push(replacement)
    frames.push({ phase: 'word', word, prefixes: [...prefixes], replacement, output: [...output], activeLine: L('output.push(replacement)'), pythonLine: P('output.append(replacement)'), message: `${word} becomes ${replacement}.` })
  }
  const result = output.join(' ')
  frames.push({ phase: 'done', word: null, prefixes: [], replacement: null, output: [...output], result, activeLine: L('.join'), pythonLine: P("return ' '.join"), message: 'Every word has been replaced.' })
  return { input: { dictionary, sentence }, result, frames }
}

const SOURCE = `function replaceWords(dictionary, sentence) {
  const roots = new Set(dictionary)
  const output = []
  for (const word of sentence.split(' ')) {
    let replacement = word
    for (let end = 1; end <= word.length; end++) {
      const prefix = word.slice(0, end)
      if (roots.has(prefix)) {
        replacement = prefix
        break
      }
    }
    output.push(replacement)
  }
  return output.join(' ')
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def replace_words(dictionary, sentence):
    roots = set(dictionary)
    output = []
    for word in sentence.split(' '):
        replacement = word
        for end in range(1, len(word) + 1):
            if word[:end] in roots:
                replacement = word[:end]
                break
        output.append(replacement)
    return ' '.join(output)`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
