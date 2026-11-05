// LeetCode 2185: Counting Words With a Given Prefix.
// Count the words that start with pref. A word starts with pref when its first pref.length characters equal pref.

const MAX_WORDS = 10
const MAX_LEN = 12

export function parseInput(text) {
  let spec
  try { spec = JSON.parse(text) } catch { throw new Error('Use JSON like {"words":["pay","attention"],"pref":"at"}.') }
  if (!spec || !Array.isArray(spec.words) || typeof spec.pref !== 'string') throw new Error('Give a words array and a pref string.')
  if (spec.words.length < 1 || spec.words.length > MAX_WORDS) throw new Error(`Use 1 to ${MAX_WORDS} words. The visualization caps the list there.`)
  if (!spec.words.every(w => typeof w === 'string' && /^[a-z]+$/.test(w) && w.length <= MAX_LEN)) throw new Error(`Each word is lowercase letters, up to ${MAX_LEN} long.`)
  if (!/^[a-z]+$/.test(spec.pref) || spec.pref.length > MAX_LEN) throw new Error(`pref is lowercase letters, up to ${MAX_LEN} long.`)
  return { words: spec.words, pref: spec.pref }
}

export const code = `FUNCTION prefixCount(words, pref)
    ans ← 0
    FOR each word in words
        IF the first length(pref) characters of word equal pref THEN
            ans ← ans + 1
    RETURN ans`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def prefix_count(words, pref):
    ans = 0
    for word in words:
        if word[:len(pref)] == pref:
            ans += 1
    return ans
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
  { id: 'start', label: 'Start', description: 'Compare each word with the prefix.' },
  { id: 'scan', label: 'Words', description: 'Check the first letters of each word.' },
  { id: 'done', label: 'Result', description: 'How many words start with the prefix.' },
]

export function buildTrace({ words, pref }) {
  let ans = 0
  const frames = []
  const push = (phase, index, activeLine, pythonLine, message, extra = {}) => frames.push({ phase, index, activeLine, pythonLine, message, words, pref, ans, ...extra })
  push('start', -1, L('ans ← 0'), P('ans = 0'), `Look for words that start with "${pref}".`)
  words.forEach((word, i) => {
    const head = word.slice(0, pref.length)
    const matches = head === pref
    if (matches) ans += 1
    push('scan', i, L('IF the first'), P('if word[:len(pref)]'),
      `"${word}": its first ${pref.length} letter(s) are "${head}", ${matches ? 'matching' : 'not matching'} "${pref}". Count ${ans}.`, { head, matches })
  })
  push('done', -1, L('RETURN ans'), P('return ans'), `${ans} word(s) start with "${pref}".`)
  return { input: { words, pref }, result: ans, frames }
}
