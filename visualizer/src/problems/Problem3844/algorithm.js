export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || typeof obj.s !== 'string') throw new Error('Use a JSON object with a string "s".')
  const { s } = obj
  if (s.length < 2 || s.length > 30) throw new Error('s must have 2 to 30 characters for this visualization.')
  if (!/^[a-z]+$/.test(s)) throw new Error('s must contain only lowercase English letters.')
  return { s }
}

export function buildTrace({ s }) {
  const n = s.length
  let best = 0
  let bestRange = null
  const frames = [{ phase: 'start', activeLine: L('set best to 0'), l: -1, r: -1, best, message: 'Try every substring and keep the longest one that is almost a palindrome.' }]
  for (let l = 0; l < n; l++) {
    for (let r = l; r < n; r++) {
      const ok = almost(s, l, r)
      if (ok && r - l + 1 > best) { best = r - l + 1; bestRange = [l, r] }
      frames.push({ phase: ok ? 'found' : 'check', activeLine: L('if s from l to r'), l, r, best, message: `${s.slice(l, r + 1)} ${ok ? 'is' : 'is not'} almost a palindrome${ok ? ` (length ${r - l + 1})` : ''}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), l: bestRange ? bestRange[0] : -1, r: bestRange ? bestRange[1] : -1, best, message: `Longest almost-palindromic substring: ${best}.` })
  return { input: { s }, result: best, frames }
}

// Two pointers match from both ends; one mismatch may be fixed by dropping either side.
function almost(s, l, r) {
  if (r === l) return false
  const isPal = (a, b) => { while (a < b) { if (s[a] !== s[b]) return false; a++; b-- } return true }
  let i = l
  let j = r
  while (i < j && s[i] === s[j]) { i++; j-- }
  if (i >= j) return true
  return isPal(i + 1, j) || isPal(i, j - 1)
}

export const code = `longest almost-palindromic substring (s):
  set best to 0
  for each start index l in s
    for each end index r from l onward
      if s from l to r is almost a palindrome then
        set best to the larger of best and (r minus l plus 1)
  return best

almost a palindrome: removing one character leaves a palindrome
match outer characters inward until the first mismatch
at a mismatch, drop one side and check the rest is a palindrome`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def longest_almost_palindrome(s):
    def is_pal(a, b):
        while a < b:
            if s[a] != s[b]:
                return False
            a += 1
            b -= 1
        return True

    def almost(l, r):
        if l == r:
            return False
        i, j = l, r
        while i < j and s[i] == s[j]:
            i += 1
            j -= 1
        if i >= j:
            return True
        return is_pal(i + 1, j) or is_pal(i, j - 1)

    best = 0
    for l in range(len(s)):
        for r in range(l, len(s)):
            if almost(l, r):
                best = max(best, r - l + 1)
    return best
`
