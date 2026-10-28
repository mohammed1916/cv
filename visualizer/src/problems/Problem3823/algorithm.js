export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).join() !== 's') throw new Error('Use a JSON object with exactly one key, s.')
  const { s } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 30) throw new Error('s must be a string of 1 to 30 characters.')
  if (!/^[A-Za-z!@#-]+$/.test(s)) throw new Error('s may contain only letters and the special characters ! @ # -.')
  return { s }
}

const isLetter = ch => /[A-Za-z]/.test(ch)

export function buildTrace({ s }) {
  const chars = [...s]
  const letterPositions = chars.map((ch, i) => (isLetter(ch) ? i : -1)).filter(i => i >= 0)
  const specialPositions = chars.map((ch, i) => (isLetter(ch) ? -1 : i)).filter(i => i >= 0)
  const frames = [{ phase: 'start', activeLine: L('make a list of the characters'), chars: [...chars], moved: [], message: 'Find the letter positions and the special character positions.' }]
  const letters = letterPositions.map(i => chars[i]).reverse()
  letterPositions.forEach((pos, k) => { chars[pos] = letters[k] })
  frames.push({ phase: 'letters', activeLine: L('put the letters back'), chars: [...chars], moved: letterPositions, message: `Reverse the ${letters.length} letters among the letter positions.` })
  const specials = specialPositions.map(i => s[i]).reverse()
  specialPositions.forEach((pos, k) => { chars[pos] = specials[k] })
  frames.push({ phase: 'specials', activeLine: L('put the special characters back'), chars: [...chars], moved: specialPositions, message: `Reverse the ${specials.length} special characters among the special positions.` })
  const result = chars.join('')
  frames.push({ phase: 'done', activeLine: L('return the result'), chars: [...chars], moved: [], message: `Result: ${result}.` })
  return { input: { s }, result, frames }
}

export const code = `reverse letters, then special characters:
  make a list of the characters of s
  collect the positions that hold letters
  collect the positions that hold special characters
  read the letters in order and reverse their order
  put the letters back into the letter positions
  read the special characters in order and reverse their order
  put the special characters back into the special positions
  return the result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def reverse_letters_then_specials(s):
    chars = list(s)
    letter_pos = [i for i, ch in enumerate(chars) if ch.isalpha()]
    special_pos = [i for i, ch in enumerate(chars) if not ch.isalpha()]
    letters = [chars[i] for i in letter_pos][::-1]
    specials = [chars[i] for i in special_pos][::-1]
    for pos, ch in zip(letter_pos, letters):
        chars[pos] = ch
    for pos, ch in zip(special_pos, specials):
        chars[pos] = ch
    return ''.join(chars)
`
