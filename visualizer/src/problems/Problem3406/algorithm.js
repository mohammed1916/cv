const lookup = (lines, text) => {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with word and numFriends.')
  const { word, numFriends } = input
  if (typeof word !== 'string' || word.length < 1 || word.length > 12 || !/^[a-z]+$/.test(word)) throw new Error('word has 1 to 12 lowercase letters.')
  if (!Number.isInteger(numFriends) || numFriends < 1 || numFriends > word.length) throw new Error('numFriends is an integer from 1 to the length of word.')
  return { word, numFriends }
}

export function buildTrace({ word, numFriends }) {
  const n = word.length
  const cap = n - numFriends + 1
  const L = text => lookup(code.map(line => line.text), text)
  const PY = text => lookup(python.split('\n'), text)
  const frames = []
  const base = { word, numFriends, cap, i: 0, j: 1, off: 0, a: null, b: null, answer: null }

  if (numFriends === 1) {
    frames.push({ ...base, j: -1, pythonLine: PY('if num_friends == 1'), phase: 'single', activeLine: L('if (numFriends === 1)'),
      message: 'One friend takes the whole word, so the box holds only word.' })
    frames.push({ ...base, j: -1, pythonLine: PY('return word'), phase: 'done', activeLine: L('return word;'), answer: word,
      message: `The largest string is ${word}.` })
    return { input: { word, numFriends }, result: word, frames }
  }

  let i = 0
  let j = 1
  let off = 0
  frames.push({ ...base, i, j, off, pythonLine: PY('i, j, k = 0, 1, 0'), phase: 'start', activeLine: L('let i = 0'),
    message: `Two candidate starts: i = 0 and j = 1. The largest suffix starts at one of them.` })
  while (j + off < n) {
    const a = word[i + off]
    const b = word[j + off]
    if (a === b) {
      off += 1
      frames.push({ ...base, i, j, off, a, b, pythonLine: PY('if word[i + k] == word[j + k]'), phase: 'match', activeLine: L('if (word[i + k] === word[j + k])'),
        message: `${a} equals ${b}; both suffixes agree so far, extend the shared run to ${off}.` })
    } else if (a < b) {
      i = Math.max(i + off + 1, j)
      j = i + 1
      off = 0
      frames.push({ ...base, i, j, off, a, b, pythonLine: PY('i = max(i + k + 1, j)'), phase: 'jump', activeLine: L('else if (word[i + k] < word[j + k])'),
        message: `${a} is less than ${b}, so the start at i cannot be the largest; move i to ${i} and j to ${j}.` })
    } else {
      j = j + off + 1
      off = 0
      frames.push({ ...base, i, j, off, a, b, pythonLine: PY('j = j + k + 1'), phase: 'skip', activeLine: L('j = j + k + 1'),
        message: `${a} is greater than ${b}, so j cannot be the largest start; move j to ${j}.` })
    }
  }
  const answer = word.slice(i, i + cap)
  frames.push({ ...base, i, j, off, answer, pythonLine: PY('return word[i:'), phase: 'slice', activeLine: L('return word.slice'),
    message: `Largest suffix starts at ${i}; keep its first ${cap} letter${cap === 1 ? '' : 's'}: ${answer}.` })
  frames.push({ ...base, i, j, off, answer, pythonLine: PY('return word[i:'), phase: 'done', activeLine: L('return word.slice'),
    message: `The largest string from the box is ${answer}.` })
  return { input: { word, numFriends }, result: answer, frames }
}

// Code panel: real JavaScript. Two pointers i and j race along the word; k is the shared run.
export const code = [
  "function largestFromBox(word, numFriends) {",
  "  const n = word.length;",
  "  if (numFriends === 1) return word;",
  "  let i = 0, j = 1, k = 0;",
  "  while (j + k < n) {",
  "    if (word[i + k] === word[j + k]) k += 1;",
  "    else if (word[i + k] < word[j + k]) {",
  "      i = Math.max(i + k + 1, j);",
  "      j = i + 1;",
  "      k = 0;",
  "    } else {",
  "      j = j + k + 1;",
  "      k = 0;",
  "    }",
  "  }",
  "  return word.slice(i, i + n - numFriends + 1);",
  "}",
].map((text, index) => ({ line: index + 1, text }))

export const python = `def largest_from_box(word, num_friends):
    n = len(word)
    if num_friends == 1:
        return word
    i, j, k = 0, 1, 0
    while j + k < n:
        if word[i + k] == word[j + k]:
            k += 1
        elif word[i + k] < word[j + k]:
            i = max(i + k + 1, j)
            j = i + 1
            k = 0
        else:
            j = j + k + 1
            k = 0
    return word[i:i + n - num_friends + 1]
`
