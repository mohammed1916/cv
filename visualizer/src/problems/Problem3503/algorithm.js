export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || Array.isArray(input) || typeof input.s !== 'string' || typeof input.t !== 'string') {
    throw new Error('Use an object such as {"s": "abc", "t": "def"}.')
  }
  const { s, t } = input
  if (s.length < 1 || s.length > 30 || t.length < 1 || t.length > 30) throw new Error('s and t each have 1 to 30 letters.')
  if (!/^[a-z]+$/.test(s) || !/^[a-z]+$/.test(t)) throw new Error('s and t use lowercase letters only.')
  return { s, t }
}

const substrings = text => {
  const out = ['']
  for (let i = 0; i < text.length; i++) for (let j = i + 1; j <= text.length; j++) out.push(text.slice(i, j))
  return out
}

// Two pointers over the joined pieces: no string is built for the palindrome test.
const isPalindromePair = (x, y) => {
  const at = index => (index < x.length ? x[index] : y[index - x.length])
  const length = x.length + y.length
  for (let a = 0, b = length - 1; a < b; a++, b--) if (at(a) !== at(b)) return false
  return true
}

export function buildTrace({ s, t }) {
  const input = { s, t }
  const frames = [{ phase: 'start', activeLine: L('set best to zero'), piece: '', best: 0, message: 'Try every substring of s in front of every substring of t.' }]
  let best = 0
  let bestPair = ['', '']
  const starts = substrings(s)
  for (const x of starts) {
    for (const y of substrings(t)) {
      if (x.length + y.length > best && isPalindromePair(x, y)) {
        best = x.length + y.length
        bestPair = [x, y]
      }
    }
    frames.push({ phase: 'piece', activeLine: L('for each substring y of t'), piece: x, best, message: `Pieces starting with "${x}" checked. Best so far ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), piece: '', best, message: `Longest palindrome: ${bestPair[0]} + ${bestPair[1]} gives length ${best}.` })
  return { input, result: best, frames }
}

export const code = `longest palindrome from a substring of s followed by a substring of t
  set best to zero
  for each substring x of s
    for each substring y of t
      if the length of x and y together is more than best
        and x followed by y reads the same both ways
        then set best to that length
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def longest_palindrome_concat(s, t):
    def substrings(text):
        out = ['']
        for i in range(len(text)):
            for j in range(i + 1, len(text) + 1):
                out.append(text[i:j])
        return out

    best = 0
    for x in substrings(s):
        for y in substrings(t):
            joined = x + y
            if len(joined) > best and joined == joined[::-1]:
                best = len(joined)
    return best
`
