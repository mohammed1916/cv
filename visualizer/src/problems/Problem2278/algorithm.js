export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || Array.isArray(value) || Object.keys(value).sort().join() !== 'letter,s') throw new Error('Use an object with exactly the keys "letter" and "s".')
  const { letter, s } = value
  if (typeof s !== 'string' || !/^[a-z]{1,30}$/.test(s)) throw new Error('s is 1 to 30 lowercase letters.')
  if (typeof letter !== 'string' || !/^[a-z]$/.test(letter)) throw new Error('letter is a single lowercase letter.')
  return { letter, s }
}

export function buildTrace({ letter, s }) {
  const frames = [{ phase: 'start', activeLine: L('set count to 0'), active: -1, roles: {}, state: { letter, count: 0 }, message: `Count the "${letter}" characters in a string of length ${s.length}.` }]
  let count = 0
  const chars = [...s]
  chars.forEach((ch, i) => {
    const match = ch === letter
    if (match) count += 1
    frames.push({ phase: 'scan', activeLine: L(match ? 'add 1 to count' : 'if the character equals letter'), active: i, roles: { [i]: match ? 'match' : 'other' }, state: { character: ch, count }, message: match ? `Position ${i} is "${letter}". Count is ${count}.` : `Position ${i} is "${ch}", not "${letter}".` })
  })
  const result = Math.floor((count * 100) / s.length)
  frames.push({ phase: 'done', activeLine: L('return count times 100'), active: -1, roles: {}, state: { count, percent: result }, message: `${count} of ${s.length} characters match, so the rounded-down percentage is ${result}.` })
  return { input: { letter, s }, result, items: chars, frames }
}

export const code = `percentage of letter in s
  set count to 0
  for each character in s
    if the character equals letter then
      add 1 to count
  return count times 100 divided by the length of s, rounded down`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def percentage_letter(s, letter):
    count = 0
    for ch in s:
        if ch == letter:
            count += 1
    return count * 100 // len(s)
`
