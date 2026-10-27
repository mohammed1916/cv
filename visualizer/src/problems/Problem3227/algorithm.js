const VOWELS = 'aeiou'

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || typeof data.s !== 'string') throw new Error('Use an object such as {"s":"leetcoder"}.')
  const { s } = data
  if (s.length < 1 || s.length > 12) throw new Error('s has 1 to 12 letters in this visualization.')
  if (![...s].every(c => c >= 'a' && c <= 'z')) throw new Error('s holds only lowercase letters.')
  return { s }
}

export function buildTrace({ s }) {
  let found = false
  const frames = [{ phase: 'start', activeLine: L('set found to false'), index: -1, found, message: 'Scan the string for a vowel.' }]
  for (let i = 0; i < s.length; i++) {
    if (VOWELS.includes(s[i]) && !found) {
      found = true
      frames.push({ phase: 'vowel', activeLine: L('if c is a vowel'), index: i, found, message: `${s[i]} is a vowel, so Alice can win.` })
    } else {
      frames.push({ phase: 'scan', activeLine: L('if c is a vowel'), index: i, found, message: `${s[i]} is ${VOWELS.includes(s[i]) ? 'a vowel' : 'not a vowel'}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return found'), index: -1, found, message: found ? 'The string contains a vowel, so Alice wins.' : 'No vowel: Alice cannot make a first move, so she loses.' })
  return { input: { s }, result: found, frames }
}

export const code = `alice wins the vowel game:
  set found to false
  for each letter c of s do
    if c is a vowel then set found to true
  return found`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def vowels_game_alice_wins(s):
    return any(c in 'aeiou' for c in s)
`
