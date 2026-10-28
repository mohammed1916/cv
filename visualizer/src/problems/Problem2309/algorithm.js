export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || Array.isArray(value) || Object.keys(value).join() !== 's') throw new Error('Use an object with exactly the key "s".')
  const { s } = value
  if (typeof s !== 'string' || !/^[A-Za-z]{1,30}$/.test(s)) throw new Error('s is 1 to 30 English letters.')
  return { s }
}

const ALPHABET_DESC = 'ZYXWVUTSRQPONMLKJIHGFEDCBA'

export function buildTrace({ s }) {
  const chars = [...s]
  const lowers = new Set()
  const uppers = new Set()
  const frames = [{ phase: 'start', activeLine: L('set lowers to an empty set'), active: -1, roles: {}, state: {}, message: 'Sort each letter into a lowercase or uppercase set.' }]
  chars.forEach((ch, i) => {
    const lower = ch === ch.toLowerCase()
    if (lower) lowers.add(ch)
    else uppers.add(ch)
    frames.push({ phase: 'collect', activeLine: L('if the character is lowercase'), active: i, roles: { [i]: lower ? 'lowercase' : 'uppercase' }, state: { lowercase: [...lowers].sort().join(''), uppercase: [...uppers].sort().join('') }, message: `"${ch}" is ${lower ? 'lowercase' : 'uppercase'}.` })
  })
  for (const letter of ALPHABET_DESC) {
    const pair = uppers.has(letter) && lowers.has(letter.toLowerCase())
    frames.push({ phase: 'check', activeLine: L('if letter is in uppers'), active: -1, roles: {}, state: { letter, both: pair }, message: `Check ${letter}: ${pair ? 'both cases appear, so return it.' : 'not in both cases.'}` })
    if (pair) {
      frames.push({ phase: 'done', activeLine: L('return letter'), active: -1, roles: {}, state: { result: letter }, message: `Return ${letter}, the greatest letter in both cases.` })
      return { input: { s }, result: letter, items: chars, frames }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return an empty string'), active: -1, roles: {}, state: { result: '' }, message: 'No letter appears in both cases, so return an empty string.' })
  return { input: { s }, result: '', items: chars, frames }
}

export const code = `greatest letter in both cases
  set lowers to an empty set
  set uppers to an empty set
  for each character in s
    if the character is lowercase then add it to lowers
    otherwise add it to uppers
  for each letter from Z down to A
    if letter is in uppers and its lowercase is in lowers then return letter
  return an empty string`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def greatest_letter(s):
    lowers = set()
    uppers = set()
    for ch in s:
        if ch.islower():
            lowers.add(ch)
        else:
            uppers.add(ch)
    for letter in "ZYXWVUTSRQPONMLKJIHGFEDCBA":
        if letter in uppers and letter.lower() in lowers:
            return letter
    return ""
`
