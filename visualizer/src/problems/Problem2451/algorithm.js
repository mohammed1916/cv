const LOWER = /^[a-z]+$/

export function diffKey(word) {
  return Array.from({ length: word.length - 1 }, (_, i) => word.charCodeAt(i + 1) - word.charCodeAt(i)).join(',')
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with words.')
  const { words } = input
  if (!Array.isArray(words) || words.length < 3 || words.length > 10) throw new Error('words has 3 to 10 entries.')
  if (!words.every(w => typeof w === 'string' && w.length >= 2 && w.length <= 8 && LOWER.test(w))) throw new Error('Each word has 2 to 8 lowercase letters.')
  if (new Set(words.map(w => w.length)).size !== 1) throw new Error('All words must have the same length.')
  const counts = new Map()
  for (const w of words) counts.set(diffKey(w), (counts.get(diffKey(w)) || 0) + 1)
  if ([...counts.values()].filter(c => c === 1).length !== 1) throw new Error('Exactly one difference pattern must be unique.')
  return { words }
}

export function buildTrace({ words }) {
  const frames = []
  const counts = new Map()
  const keys = words.map(diffKey)
  frames.push({ pythonLine: PL('counts = {}'), phase: 'setup', activeLine: CL('counts <-'), at: -1, key: null, counts: [], message: 'Start with no difference patterns counted.' })
  keys.forEach((key, i) => {
    frames.push({ pythonLine: PL('key = tuple'), phase: 'diff', activeLine: CL('key <-'), at: i, key, counts: [...counts], message: `${words[i]} has adjacent differences ${key}.` })
    counts.set(key, (counts.get(key) || 0) + 1)
    frames.push({ pythonLine: PL('counts[key] = '), phase: 'tally', activeLine: CL('add one'), at: i, key, counts: [...counts], message: `Pattern ${key} is now seen ${counts.get(key)} time${counts.get(key) === 1 ? '' : 's'}.` })
  })
  let answer = null
  for (let i = 0; i < words.length && answer === null; i++) {
    const seen = counts.get(keys[i])
    frames.push({ pythonLine: PL('if counts[keys[i]] == 1'), phase: 'check', activeLine: CL('IF counts'), at: i, key: keys[i], counts: [...counts], message: `${words[i]} has a pattern seen ${seen} time${seen === 1 ? '' : 's'}.` })
    if (seen === 1) answer = words[i]
  }
  frames.push({ pythonLine: PL('return word'), phase: 'done', activeLine: CL('RETURN word'), at: words.indexOf(answer), key: answer === null ? null : keys[words.indexOf(answer)], counts: [...counts], message: `${answer} is the odd string.` })
  return { input: { words }, result: answer, frames }
}

export const code = `FUNCTION oddString(words)
  counts <- empty map from difference pattern to count
  FOR each word in words
    key <- differences between neighbouring letters
    add one to counts[key]
  FOR each word in words
    IF counts[key of this word] equals 1 THEN RETURN word
  RETURN empty string`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def odd_string(words):
    counts = {}
    keys = []
    for word in words:
        key = tuple(ord(b) - ord(a) for a, b in zip(word, word[1:]))
        keys.append(key)
        counts[key] = counts.get(key, 0) + 1
    for i, word in enumerate(words):
        if counts[keys[i]] == 1:
            return word
    return ""
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
