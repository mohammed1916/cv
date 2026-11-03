// LeetCode 3167 (draft reading): a compressed string is a series of groups, each one lowercase
// letter followed by a positive decimal frequency. A letter may appear in several groups.
// Add the frequencies per letter, then emit one group per present letter in alphabetical order.

const MAX_GROUPS = 16
const MAX_DIGITS = 6

const CODE_TEXT = `FUNCTION compress(s)
    totals ← 26 zeros, one per letter
    i ← 0
    WHILE i < length of s
        letter ← s[i]; i ← i + 1
        read the digits starting at i into number; advance i past them
        totals[letter] ← totals[letter] + number
    result ← empty text
    FOR letter from a to z
        IF totals[letter] > 0 THEN append letter and totals[letter] to result
    RETURN result`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def better_compression(s):
    totals = [0] * 26
    i = 0
    while i < len(s):
        letter = s[i]
        i += 1
        start = i
        while i < len(s) and s[i].isdigit():
            i += 1
        totals[ord(letter) - ord("a")] += int(s[start:i])
    parts = []
    for k in range(26):
        if totals[k]:
            parts.append(chr(ord("a") + k) + str(totals[k]))
    return "".join(parts)
`
const PY = s => {
  const index = python.split('\n').findIndex(c => c.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || !/^([a-z][1-9][0-9]*)+$/.test(s)) throw new Error('Use a string of letter-and-number groups, such as "a3c9b2".')
  const groups = s.match(/[a-z][0-9]+/g)
  if (groups.length > MAX_GROUPS) throw new Error(`Use at most ${MAX_GROUPS} groups.`)
  if (groups.some(g => g.length - 1 > MAX_DIGITS)) throw new Error(`Each frequency has at most ${MAX_DIGITS} digits in this visualization.`)
  return s
}

export function buildTrace(s) {
  const groups = s.match(/[a-z][0-9]+/g)
  const totals = Array(26).fill(0)
  const frames = []
  const snapshot = () => totals.slice()
  frames.push({ phase: 'start', pythonLine: PY('totals = [0] * 26'), activeLine: L('totals ← 26 zeros'), s, groups, group: -1, letter: '', number: 0, totals: snapshot(), output: '', message: `Read ${groups.length} group${groups.length === 1 ? '' : 's'} from ${s}.` })
  let i = 0
  groups.forEach((group, index) => {
    const letter = group[0]
    const number = Number(group.slice(1))
    totals[letter.charCodeAt(0) - 97] += number
    frames.push({ phase: 'group', pythonLine: PY('totals[ord(letter) - ord("a")] +='), activeLine: L('totals[letter] ← totals[letter] + number'), s, groups, group: index, letter, number, totals: snapshot(), output: '', message: `Add ${number} to ${letter}: ${letter} is now ${totals[letter.charCodeAt(0) - 97]}.` })
    i += group.length
  })
  const parts = []
  for (let k = 0; k < 26; k++) {
    const letter = String.fromCharCode(97 + k)
    if (totals[k] > 0) {
      parts.push(`${letter}${totals[k]}`)
      frames.push({ phase: 'emit', pythonLine: PY('parts.append(chr'), activeLine: L('append letter and totals[letter]'), s, groups, group: -1, letter, number: totals[k], totals: snapshot(), output: parts.join(''), message: `${letter} appears with total ${totals[k]}; emit ${letter}${totals[k]}.` })
    }
  }
  const output = parts.join('')
  frames.push({ phase: 'done', pythonLine: PY('return "".join(parts)'), activeLine: L('RETURN result'), s, groups, group: -1, letter: '', number: 0, totals: snapshot(), output, message: `Compressed result: ${output}.` })
  return { input: s, result: output, frames }
}
