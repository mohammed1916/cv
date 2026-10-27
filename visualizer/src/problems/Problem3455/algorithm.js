export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with "s" and "p" strings.')
  const { s, p } = input
  if (typeof s !== 'string' || typeof p !== 'string') throw new Error('s and p must be strings.')
  if (s.length < 1 || s.length > 20) throw new Error('s must have 1 to 20 characters.')
  if (!/^[a-z]+$/.test(s)) throw new Error('s uses lowercase letters a to z only.')
  if (p.length > 20) throw new Error('p must have at most 20 characters.')
  if (!/^[a-z*]*$/.test(p)) throw new Error('p uses lowercase letters a to z and exactly two stars.')
  if (p.split('*').length !== 3) throw new Error('p must contain exactly two stars.')
  return { s, p }
}

export function buildTrace({ s, p }) {
  const [prefix, middle, suffix] = p.split('*')
  const frames = []
  let best = null
  frames.push({ phase: 'start', activeLine: L('split p at its two stars'), start: -1, middle: -1, end: -1, best, message: `Split p into prefix "${prefix}", middle "${middle}" and suffix "${suffix}".` })
  for (let i = 0; i <= s.length; i++) {
    frames.push({ phase: 'start', activeLine: L('for each start index'), start: i, middle: -1, end: -1, best, message: `Try a match that starts at ${i}.` })
    if (!s.startsWith(prefix, i)) {
      frames.push({ phase: 'prefix', activeLine: L('if the prefix does not start at i'), start: i, middle: -1, end: -1, best, message: `The prefix "${prefix}" does not start at ${i}; skip it.` })
      continue
    }
    const k = s.indexOf(middle, i + prefix.length)
    if (k === -1) {
      frames.push({ phase: 'middle', activeLine: L('if no middle is found'), start: i, middle: -1, end: -1, best, message: `No middle "${middle}" follows the prefix; skip ${i}.` })
      continue
    }
    const q = s.indexOf(suffix, k + middle.length)
    if (q === -1) {
      frames.push({ phase: 'suffix', activeLine: L('if no suffix is found'), start: i, middle: k, end: -1, best, message: `The middle is at ${k} but no suffix "${suffix}" follows it; skip ${i}.` })
      continue
    }
    const end = q + suffix.length
    const length = end - i
    if (best === null || length < best) best = length
    frames.push({ phase: 'record', activeLine: L('if best is nothing'), start: i, middle: k, end, best, message: `Match s[${i}..${end - 1}] has length ${length}. Best so far: ${best}.` })
  }
  const result = best === null ? -1 : best
  frames.push({ phase: 'done', activeLine: L('return best'), start: -1, middle: -1, end: -1, best: result, message: `Shortest matching substring length: ${result}.` })
  return { input: { s, p }, result, frames }
}

export const code = `shortest substring of s that matches p
  split p at its two stars into prefix, middle and suffix
  set best to nothing
  for each start index i from 0 to len(s)
    if the prefix does not start at i then skip i
    find the earliest middle that begins after the prefix
    if no middle is found then skip i
    find the earliest suffix that begins after the middle
    if no suffix is found then skip i
    let length be the end of the suffix minus i
    if best is nothing or length is smaller than best then set best to length
  return best, or -1 if nothing matched`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def shortest_matching_substring(s, p):
    prefix, middle, suffix = p.split('*')
    best = None
    for i in range(len(s) + 1):
        if not s.startswith(prefix, i):
            continue
        k = s.find(middle, i + len(prefix))
        if k == -1:
            continue
        q = s.find(suffix, k + len(middle))
        if q == -1:
            continue
        length = q + len(suffix) - i
        if best is None or length < best:
            best = length
    return -1 if best is None else best
`
