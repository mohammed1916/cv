export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || Array.isArray(value) || Object.keys(value).join() !== 's') throw new Error('Use an object with exactly the key "s".')
  const { s } = value
  if (typeof s !== 'string' || !/^[a-z]{1,20}$/.test(s)) throw new Error('s is 1 to 20 lowercase letters.')
  return { s }
}

export function buildTrace({ s }) {
  const chars = [...s]
  const seen = new Set()
  const frames = [{ phase: 'start', activeLine: L('set seen to an empty set'), active: -1, roles: {}, state: { distinct: 0 }, message: 'Each letter that appears can keep exactly one copy, so count the distinct letters.' }]
  chars.forEach((ch, i) => {
    const repeat = seen.has(ch)
    seen.add(ch)
    frames.push({ phase: 'scan', activeLine: L('add the character to seen'), active: i, roles: { [i]: repeat ? 'repeat' : 'first' }, state: { letter: ch, distinct: seen.size }, message: repeat ? `"${ch}" repeats. Its extra copies pair off and vanish, leaving one.` : `"${ch}" is new, so it survives.` })
  })
  frames.push({ phase: 'done', activeLine: L('return answer'), active: -1, roles: {}, state: { distinct: seen.size }, message: `Return ${seen.size}, the number of distinct letters.` })
  return { input: { s }, result: seen.size, items: chars, frames }
}

export const code = `minimum length of s after removals
  set seen to an empty set
  for each character in s
    add the character to seen
  set answer to the number of characters in seen
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimize_string_length(s):
    seen = set()
    for ch in s:
        seen.add(ch)
    return len(seen)
`
