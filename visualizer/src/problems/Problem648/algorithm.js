export function parseInput(text) {
  const data = JSON.parse(text)
  const { dictionary, sentence } = data ?? {}
  if (!Array.isArray(dictionary) || dictionary.length < 1 || dictionary.length > 1000 || dictionary.some(w => typeof w !== 'string' || !/^[a-z]{1,100}$/.test(w))) throw new Error('dictionary must hold 1–1,000 lowercase roots.')
  if (typeof sentence !== 'string' || !/^[a-z]+( [a-z]+)*$/.test(sentence) || sentence.length > 4000) throw new Error('sentence must be lowercase words separated by single spaces.')
  return { dictionary, sentence }
}

// Each word takes the shortest dictionary root that is one of its prefixes.
export function buildTrace({ dictionary, sentence }) {
  const roots = new Set(dictionary)
  const words = sentence.split(' ')
  const out = []
  const frames = [{ phase: 'start', word: null, prefix: '', out: [], activeLine: 2, message: 'Load the roots into a set; each word looks for its shortest root prefix.' }]
  for (const word of words) {
    let replacement = word
    let prefix = ''
    let found = false
    for (let i = 1; i <= word.length; i++) {
      prefix = word.slice(0, i)
      if (roots.has(prefix)) { replacement = prefix; found = true; break }
    }
    out.push(replacement)
    frames.push({ phase: 'word', word, prefix: found ? prefix : word, found, out: [...out], activeLine: found ? 6 : 8,
      message: found ? `${word}: shortest root prefix ${prefix} replaces it.` : `${word}: no root is a prefix, so it stays.` })
  }
  const result = out.join(' ')
  frames.push({ phase: 'done', word: null, prefix: '', out: [...out], result, activeLine: 10, message: `Result: ${result}` })
  return { input: { dictionary, sentence }, result, frames }
}

export const code = `build a trie from the dictionary and mark the end of each root
for each word in the sentence, split on single spaces:
  start at the trie root with replacement equal to the word
  for each character, follow its child edge, stopping if the edge is missing
  if the node marks the end of a root, set replacement to the prefix read so far and stop
  append replacement to the output
return the output words joined with single spaces`.split('\n').map((text, index) => ({ line: index + 1, text }))

// Collection trace stages from the trie walk: insert and store are line 1, lookup and missing are line 4,
// accept is line 5, append is line 6, and return is line 7.
const STAGE_LINE = { insert: 1, store: 1, lookup: 4, missing: 4, accept: 5, append: 6, return: 7 }
export const LINE_MAP = { 1: 1, 3: 4, 4: 6, 5: 7 }

export function familyLine(frame) {
  return STAGE_LINE[frame.codeStage] ?? LINE_MAP[frame.activeLine] ?? frame.activeLine
}

export const python = `def replace_words(dictionary, sentence):
    roots = set(dictionary)
    output = []
    for word in sentence.split(' '):
        replacement = word
        for i in range(len(word)):
            if word[:i + 1] in roots:
                replacement = word[:i + 1]
                break
        output.append(replacement)
    return ' '.join(output)`
