export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s and p strings.')
  const { s, p } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 20 || !/^[a-z]+$/.test(s)) throw new Error('s has 1 to 20 lowercase letters.')
  if (typeof p !== 'string' || !/^[a-z]*\*[a-z]*$/.test(p)) throw new Error('p is a prefix, one star, and a suffix of lowercase letters.')
  return { s, p }
}

export function buildTrace({ s, p }) {
  const [prefix, suffix] = p.split('*')
  const frames = []
  let found = false
  frames.push({ phase: 'start', activeLine: L('split p at its star'), start: -1, at: -1, message: `Prefix "${prefix}", suffix "${suffix}".` })
  for (let i = 0; i <= s.length && !found; i++) {
    frames.push({ phase: 'start', activeLine: L('for each start index'), start: i, at: -1, message: `Try a match beginning at ${i}.` })
    if (!s.startsWith(prefix, i)) {
      frames.push({ phase: 'prefix', activeLine: L('if the prefix does not start'), start: i, at: -1, message: `The prefix does not start at ${i}.` })
      continue
    }
    const at = s.indexOf(suffix, i + prefix.length)
    if (at !== -1) {
      found = true
      frames.push({ phase: 'found', activeLine: L('if the suffix appears'), start: i, at, message: `The suffix appears at ${at}, after the prefix. A match exists.` })
    } else {
      frames.push({ phase: 'suffix', activeLine: L('if the suffix appears'), start: i, at: -1, message: `No suffix "${suffix}" follows the prefix at ${i}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return false'), start: -1, at: -1, message: found ? 'Match found.' : 'No substring matches p.' })
  return { input: { s, p }, result: found, frames }
}

export const code = `does s contain a substring matching prefix star suffix
  split p at its star into prefix and suffix
  for each start index i from 0 to len(s)
    if the prefix does not start at i then skip i
    if the suffix appears at or after the end of the prefix then return true
  return false`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def pattern_match_exists(s, p):
    prefix, suffix = p.split('*')
    for i in range(len(s) + 1):
        if not s.startswith(prefix, i):
            continue
        if s.find(suffix, i + len(prefix)) != -1:
            return True
    return False
`
