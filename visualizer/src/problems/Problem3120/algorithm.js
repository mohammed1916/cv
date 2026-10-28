export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || Array.isArray(value) || Object.keys(value).join() !== 'word') throw new Error('Use an object with exactly the key "word".')
  const { word } = value
  if (typeof word !== 'string' || !/^[A-Za-z]{1,30}$/.test(word)) throw new Error('word is 1 to 30 English letters.')
  return { word }
}

export function buildTrace({ word }) {
  const chars = [...word]
  const lowers = new Set()
  const uppers = new Set()
  const frames = [{ phase: 'start', activeLine: L('set lowers to the lowercase letters'), active: -1, roles: {}, state: {}, message: 'Collect the lowercase letters and the uppercase letters separately.' }]
  chars.forEach((ch, i) => {
    if (ch === ch.toLowerCase()) lowers.add(ch)
    else uppers.add(ch)
    frames.push({ phase: 'collect', activeLine: L('set uppers to the uppercase letters'), active: i, roles: { [i]: ch === ch.toLowerCase() ? 'lowercase' : 'uppercase' }, state: { lowercase: [...lowers].sort().join(''), uppercase: [...uppers].sort().join('') }, message: `"${ch}" is recorded in its case set.` })
  })
  let count = 0
  for (const ch of [...lowers].sort()) {
    const hasPair = uppers.has(ch.toUpperCase())
    if (hasPair) count += 1
    frames.push({ phase: 'count', activeLine: L(hasPair ? 'add 1 to count' : 'if the uppercase of letter is in uppers'), active: -1, roles: {}, state: { letter: ch, count }, message: `"${ch}" ${hasPair ? 'appears in both cases. Count is ' + count + '.' : 'has no uppercase copy.'}` })
  }
  frames.push({ phase: 'done', activeLine: L('return count'), active: -1, roles: {}, state: { count }, message: `Return ${count}.` })
  return { input: { word }, result: count, items: chars, frames }
}

export const code = `count letters that appear in both cases
  set lowers to the lowercase letters in word
  set uppers to the uppercase letters in word
  set count to 0
  for each letter in lowers
    if the uppercase of letter is in uppers then
      add 1 to count
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_special_characters_i(word):
    lowers = set(ch for ch in word if ch.islower())
    uppers = set(ch for ch in word if ch.isupper())
    count = 0
    for ch in lowers:
        if ch.upper() in uppers:
            count += 1
    return count
`
