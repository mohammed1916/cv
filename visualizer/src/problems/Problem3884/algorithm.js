export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || typeof obj.s !== 'string') throw new Error('Use a JSON object with a string "s".')
  const { s } = obj
  if (s.length < 1 || s.length > 30) throw new Error('s must have 1 to 30 characters for this visualization.')
  if (!/^[a-z]+$/.test(s)) throw new Error('s must contain only lowercase English letters.')
  return { s }
}

export function buildTrace({ s }) {
  const n = s.length
  const frames = [{ phase: 'start', activeLine: L('set n to'), index: -1, mirror: -1, result: null, message: `Compare each index with its mirror position in a string of length ${n}.` }]
  let result = -1
  for (let i = 0; i < n; i++) {
    const mirror = n - 1 - i
    const hit = s[i] === s[mirror]
    frames.push({ phase: hit ? 'found' : 'check', activeLine: L('if s[i] equals'), index: i, mirror, result: null,
      message: `Compare s[${i}] = ${s[i]} with s[${mirror}] = ${s[mirror]}${hit ? ', they match' : ', no match'}.` })
    if (hit) { result = i; break }
  }
  frames.push({ phase: 'done', activeLine: L('return -1'), index: result, mirror: null, result, message: `Answer: ${result}.` })
  return { input: { s }, result, frames }
}

export const code = `first matching character from both ends (s):
  set n to the length of s
  for each index i from 0 to n minus 1
    set mirror to n minus 1 minus i
    if s[i] equals s[mirror] then
      return i
  return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def first_matching_from_ends(s):
    n = len(s)
    for i in range(n):
        if s[i] == s[n - 1 - i]:
            return i
    return -1
`
