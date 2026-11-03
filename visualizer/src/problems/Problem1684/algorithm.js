export const phases = [
  { id: 'start', label: 'Start', description: 'Put the allowed letters in a set and start the count at zero.' },
  { id: 'letter', label: 'Check letter', description: 'Look up one letter of the current word in the allowed set.' },
  { id: 'reject', label: 'Reject word', description: 'A letter is not allowed, so this word is inconsistent and the rest of it is skipped.' },
  { id: 'accept', label: 'Count word', description: 'Every letter was allowed, so the word is consistent and the count goes up.' },
  { id: 'done', label: 'Result', description: 'The count of consistent words is the answer.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"allowed": "ab", "words": ["ba", "cab"]}.')
  const { allowed, words } = input
  if (typeof allowed !== 'string' || allowed.length < 1 || allowed.length > 26 || !/^[a-z]+$/.test(allowed)) throw new Error('allowed is 1 to 26 lowercase letters.')
  if (new Set(allowed).size !== allowed.length) throw new Error('allowed must not repeat a letter.')
  if (!Array.isArray(words) || words.length < 1 || words.length > 12) throw new Error('words is a list of 1 to 12 entries.')
  if (!words.every(w => typeof w === 'string' && w.length >= 1 && w.length <= 10 && /^[a-z]+$/.test(w))) throw new Error('Each word is 1 to 10 lowercase letters.')
  return { allowed, words }
}

// Each phase points at one line of the code and one line of the Python.
const LINE = {
  start: [2, 2], letter: [7, 7], reject: [8, 8], accept: [9, 11], done: [10, 12],
}
const at = phase => ({ activeLine: LINE[phase][0], pythonLine: LINE[phase][1] })

export function buildTrace({ allowed, words }) {
  const allowedSet = new Set(allowed)
  let count = 0
  const frames = []
  const snap = (wordIndex, charIndex, outcome) => ({
    wordIndex, charIndex, outcome, count, allowed: [...allowed],
    word: wordIndex === null ? null : words[wordIndex],
  })
  frames.push({
    phase: 'start', ...at('start'), snapshot: snap(null, null, null),
    message: `Allowed letters: ${[...allowed].join(', ')}. A word counts only if every one of its letters is in this set.`,
  })
  words.forEach((word, w) => {
    let consistent = true
    for (let c = 0; c < word.length; c++) {
      const ch = word[c]
      if (allowedSet.has(ch)) {
        frames.push({
          phase: 'letter', ...at('letter'), snapshot: snap(w, c, 'allowed'),
          message: `Word ${w + 1} "${word}", letter ${c + 1} is ${ch}, which is allowed.`,
        })
      } else {
        consistent = false
        frames.push({
          phase: 'reject', ...at('reject'), snapshot: snap(w, c, 'rejected'),
          message: `Word ${w + 1} "${word}" has ${ch} at position ${c + 1}, which is not allowed. The word does not count.`,
        })
        break
      }
    }
    if (consistent) {
      count += 1
      frames.push({
        phase: 'accept', ...at('accept'), snapshot: snap(w, word.length - 1, 'counted'),
        message: `Word ${w + 1} "${word}" uses only allowed letters, so the count is ${count}.`,
      })
    }
  })
  frames.push({
    phase: 'done', ...at('done'), snapshot: snap(null, null, null),
    message: `${count} of ${words.length} words are consistent.`,
  })
  return { input: { allowed, words }, result: count, frames }
}

const codeText = `count consistent (allowed, words):
  allowedSet = the letters of allowed
  count = 0
  for each word in words:
    consistent = true
    for each letter c in word:
      if c not in allowedSet:
        consistent = false, stop this word
    if consistent: count += 1
  return count`
export const code = codeText.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def count_consistent_strings(allowed, words):
    allowed_set = set(allowed)
    count = 0
    for word in words:
        consistent = True
        for ch in word:
            if ch not in allowed_set:
                consistent = False
                break
        if consistent:
            count += 1
    return count
`
