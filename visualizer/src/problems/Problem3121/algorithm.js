export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || Array.isArray(value) || Object.keys(value).join() !== 'word') throw new Error('Use an object with exactly the key "word".')
  const { word } = value
  if (typeof word !== 'string' || !/^[A-Za-z]{1,30}$/.test(word)) throw new Error('word is 1 to 30 English letters.')
  return { word }
}

export function buildTrace({ word }) {
  const chars = [...word]
  const firstUpper = new Map()
  const lastLower = new Map()
  const frames = [{ phase: 'start', activeLine: L('set firstUpper to an empty map'), active: -1, roles: {}, state: {}, message: 'Track the first uppercase position and the last lowercase position of each letter.' }]
  chars.forEach((ch, i) => {
    if (ch === ch.toUpperCase()) {
      if (!firstUpper.has(ch)) firstUpper.set(ch, i)
      frames.push({ phase: 'upper', activeLine: L('if the letter at i is uppercase'), active: i, roles: { [i]: 'uppercase' }, state: { letter: ch, firstUpper: firstUpper.get(ch) }, message: `"${ch}" at ${i} is uppercase. First uppercase ${ch} is at ${firstUpper.get(ch)}.` })
    } else {
      lastLower.set(ch, i)
      frames.push({ phase: 'lower', activeLine: L('record i in lastLower'), active: i, roles: { [i]: 'lowercase' }, state: { letter: ch, lastLower: i }, message: `"${ch}" at ${i} is lowercase. Last lowercase ${ch} is now at ${i}.` })
    }
  })
  let count = 0
  for (const [ch, last] of lastLower) {
    const upper = ch.toUpperCase()
    const special = firstUpper.has(upper) && last < firstUpper.get(upper)
    if (special) count += 1
    frames.push({ phase: 'count', activeLine: L('lastLower[letter] < firstUpper'), active: -1, roles: {}, state: { letter: ch, special, count }, message: `"${ch}": ${special ? 'every lowercase comes before the first uppercase, so it is special.' : 'not special.'}` })
  }
  frames.push({ phase: 'done', activeLine: L('return count'), active: -1, roles: {}, state: { count }, message: `Return ${count}.` })
  return { input: { word }, result: count, items: chars, frames }
}

export const code = `count special letters
  set firstUpper to an empty map
  set lastLower to an empty map
  for each index i in word
    if the letter at i is uppercase and it is not yet in firstUpper then
      record i in firstUpper
    if the letter at i is lowercase then
      record i in lastLower
  set count to 0
  for each letter in lastLower
    if the uppercase of letter is in firstUpper and lastLower[letter] < firstUpper[uppercase] then
      add 1 to count
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_special_characters_ii(word):
    first_upper = {}
    last_lower = {}
    for i, ch in enumerate(word):
        if ch.isupper():
            if ch not in first_upper:
                first_upper[ch] = i
        else:
            last_lower[ch] = i
    count = 0
    for ch, last in last_lower.items():
        up = ch.upper()
        if up in first_upper and last < first_upper[up]:
            count += 1
    return count
`
