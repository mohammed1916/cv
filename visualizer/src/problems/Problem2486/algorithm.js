export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('Use an object with the keys "s" and "t".')
  const { s, t } = obj
  if (typeof s !== 'string' || typeof t !== 'string') throw new Error('Both s and t must be strings.')
  if (s.length < 1 || s.length > 30 || t.length < 1 || t.length > 30) throw new Error('Each string has 1 to 30 characters.')
  if (!/^[a-z]+$/.test(s) || !/^[a-z]+$/.test(t)) throw new Error('Use lowercase letters only.')
  return { s, t }
}

export function buildTrace(input) {
  const { s, t } = input
  const frames = [{ phase: 'start', activeLine: L('set j to 0'), i: -1, j: 0, message: `Match t = "${t}" greedily inside s = "${s}".` }]
  let j = 0
  for (let i = 0; i < s.length; i++) {
    frames.push({ phase: 'scan', activeLine: L('for each character'), i, j, message: `Look at s[${i}] = ${s[i]}.` })
    if (j < t.length && s[i] === t[j]) {
      j++
      frames.push({ phase: 'match', activeLine: L('move j forward'), i, j, message: `${s[i]} matches t[${j - 1}], so j becomes ${j}.` })
    }
  }
  const result = t.length - j
  frames.push({ phase: 'done', activeLine: L('return the length'), i: s.length, j, message: `${j} letters of t were matched in order, so ${result} must be appended.` })
  return { input, result, frames }
}

export const code = `append characters to make t a subsequence of s
  set j to 0
  for each character of s do
    if j is less than the length of t and the character equals t[j] then
      move j forward by one
  return the length of t minus j`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def append_characters(s, t):
    j = 0
    for c in s:
        if j < len(t) and c == t[j]:
            j += 1
    return len(t) - j
`
