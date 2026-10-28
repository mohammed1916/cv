export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).sort().join() !== 'k,s') throw new Error('Use a JSON object with exactly the keys s and k.')
  const { s, k } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 40) throw new Error('s must be a string of 1 to 40 letters.')
  if (!/^[a-z]+$/.test(s)) throw new Error('s may contain only lowercase letters a to z.')
  if (!Number.isInteger(k) || k < 1 || k > s.length) throw new Error('k must be an integer from 1 to the length of s.')
  return { s, k }
}

export function buildTrace({ s, k }) {
  const n = s.length
  const frames = [{ phase: 'start', activeLine: L('for each start position'), start: -1, k, message: `Look for a block of exactly ${k} equal letters.` }]
  for (let i = 0; i + k <= n; i++) {
    const ch = s[i]
    let uniform = true
    for (let t = i; t < i + k; t++) if (s[t] !== ch) uniform = false
    if (!uniform) {
      frames.push({ phase: 'scan', activeLine: L('if every letter in the window'), start: i, k, message: `The window at ${i} mixes letters, so it fails.` })
      continue
    }
    const before = i === 0 || s[i - 1] !== ch
    const after = i + k === n || s[i + k] !== ch
    if (before && after) {
      frames.push({ phase: 'found', activeLine: L('return true'), start: i, k, message: `The window at ${i} is ${ch} repeated ${k} times, and its neighbors are not ${ch}. Special substring found.` })
      return { input: { s, k }, result: true, frames }
    }
    frames.push({ phase: 'scan', activeLine: L('if the letter before i'), start: i, k, message: `The window at ${i} is uniform, but it runs on into a longer block, so it does not count.` })
  }
  frames.push({ phase: 'done', activeLine: L('return false'), start: -1, k, message: 'No block of exactly k equal letters is bounded by different letters.' })
  return { input: { s, k }, result: false, frames }
}

export const code = `special substring of length k:
  for each start position i where a window of length k fits
    let ch be the letter at i
    if every letter in the window equals ch then
      if the letter before i is not ch or there is none then
        if the letter after the window is not ch or there is none then
          return true
  return false`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def special_substring(s, k):
    n = len(s)
    for i in range(n - k + 1):
        ch = s[i]
        if all(c == ch for c in s[i:i + k]):
            if (i == 0 or s[i - 1] != ch) and (i + k == n or s[i + k] != ch):
                return True
    return False
`
