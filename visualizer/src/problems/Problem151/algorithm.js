export const phases = [
  { id: 'setup', label: 'Set up', description: 'Start with an empty list of words and a cursor at the beginning of the text.' },
  { id: 'skip', label: 'Skip spaces', description: 'Spaces separate words but are never part of one, so the cursor moves past them.' },
  { id: 'word', label: 'Read a word', description: 'Scan to the next space. The characters in between form one word.' },
  { id: 'reverse', label: 'Reverse the order', description: 'The words are reversed, so the last word becomes the first.' },
  { id: 'join', label: 'Join', description: 'Join the words with exactly one space between them.' },
  { id: 'done', label: 'Complete', description: 'Return the reversed sentence.' },
]

export function parseInput(text) {
  if (typeof text !== 'string') throw new Error('Enter a sentence of up to 60 characters.')
  if (text.length > 60) throw new Error('Keep the sentence to 60 characters or fewer.')
  if (!/^[\x20-\x7e]*$/.test(text)) throw new Error('Use plain printable ASCII characters.')
  if (!/[^ ]/.test(text)) throw new Error('Enter at least one non-space character.')
  return text
}

export const code = `reverse words (s):
  words = empty list
  i = 0
  while i < length of s:
    if s[i] is a space: i = i + 1, continue
    j = i
    while j < length of s and s[j] is not a space: j = j + 1
    append s[i..j) to words
    i = j
  reverse words
  return words joined with single spaces`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def reverse_words(s):
    words = []
    i = 0
    while i < len(s):
        if s[i] == ' ':
            i += 1
            continue
        j = i
        while j < len(s) and s[j] != ' ':
            j += 1
        words.append(s[i:j])
        i = j
    words.reverse()
    return ' '.join(words)
`

const SPOT = {
  setup: ['words = empty list', 'words = []'],
  skip: ['if s[i] is a space', "if s[i] == ' '"],
  word: ['while j < length of s', 'while j < len(s)'],
  append: ['append s[i..j)', 'words.append(s[i:j])'],
  reverse: ['reverse words', 'words.reverse()'],
  done: ['return words joined', "return ' '.join(words)"],
}
function where(key) {
  const [pseudo, py] = SPOT[key]
  return {
    activeLine: code.findIndex(c => c.text.includes(pseudo)) + 1,
    pythonLine: python.split('\n').findIndex(l => l.includes(py)) + 1,
  }
}

export function buildTrace(s) {
  const words = []
  const frames = []
  const emit = (phase, key, message, snapshot) => frames.push({ phase, ...where(key), message, snapshot })
  const snap = (i, current) => ({ i, current, words: [...words], text: s })

  emit('setup', 'setup', `Read "${s}" from left to right. The words found so far are listed below.`, snap(0, null))
  let i = 0
  while (i < s.length) {
    if (s[i] === ' ') {
      emit('skip', 'skip', `Position ${i} is a space, so the cursor moves on.`, snap(i, null))
      i += 1
      continue
    }
    let j = i
    while (j < s.length && s[j] !== ' ') j += 1
    const word = s.slice(i, j)
    words.push(word)
    emit('word', 'append', `Characters ${i} to ${j - 1} form the word "${word}". Words so far: ${words.length}.`, snap(i, word))
    i = j
  }
  const reversed = [...words].reverse()
  emit('reverse', 'reverse', `The words in order were ${words.map(w => `"${w}"`).join(', ')}. Reversing gives ${reversed.map(w => `"${w}"`).join(', ')}.`, { i: s.length, current: null, words: reversed, text: s })
  const result = reversed.join(' ')
  emit('join', 'done', `Join the reversed words with single spaces: "${result}".`, { i: s.length, current: null, words: reversed, text: s, result })
  emit('done', 'done', `Result: "${result}".`, { i: s.length, current: null, words: reversed, text: s, result })
  return { input: s, result, frames }
}
