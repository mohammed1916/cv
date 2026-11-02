export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with word and k.')
  const { word, k } = input
  if (typeof word !== 'string' || word.length < 1 || word.length > 50 || !/^[a-z]+$/.test(word)) throw new Error('word has 1 to 50 lowercase letters.')
  if (!Number.isInteger(k) || k < 1 || k > word.length) throw new Error('k is an integer from 1 to the word length.')
  return { word, k }
}

export function buildTrace({ word, k }) {
  const frames = []
  const n = word.length
  let t = 1
  frames.push({ pythonLine: 3, phase: 'start', activeLine: L('t = 1'), t, cut: null, message: `Try ${n} letters, removing ${k} each second.` })
  for (;;) {
    if (t * k >= n) {
      frames.push({ pythonLine: 6, phase: 'free', activeLine: L('if t times k is at least n, return t'), t, cut: t * k, message: `After ${t} seconds every letter was removed; the appended letters can rebuild the word.` })
      return { input: { word, k }, result: t, frames }
    }
    const rest = word.slice(t * k)
    const prefix = word.slice(0, n - t * k)
    if (rest === prefix) {
      frames.push({ pythonLine: 8, phase: 'match', activeLine: L('if the word after t times k letters equals'), t, cut: t * k, rest, prefix, message: `"${rest}" matches the start of the word, so ${t} seconds work.` })
      return { input: { word, k }, result: t, frames }
    }
    frames.push({ pythonLine: 9, phase: 'miss', activeLine: L('t = t plus 1'), t, cut: t * k, rest, prefix, message: `"${rest}" does not match "${prefix}"; try ${t + 1}.` })
    t += 1
  }
}

export const code = `minimum seconds to revert the word
  n = length of word
  t = 1
  repeat
    if t times k is at least n, return t
    if the word after t times k letters equals the start of the word, return t
    t = t plus 1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_time(word, k):
    n = len(word)
    t = 1
    while True:
        if t * k >= n:
            return t
        if word[t * k:] == word[:n - t * k]:
            return t
        t += 1
`
