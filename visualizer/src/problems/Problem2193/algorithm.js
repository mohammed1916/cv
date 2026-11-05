// LeetCode 2193: Minimum Number of Moves to Make Palindrome.
// Work from the outside in. For the left character s[i], find its match from the right, at position k > i.
// Move that match to the right end (k to j costs j - k adjacent swaps). If no match exists, s[i] is the odd
// character: it must travel to the middle, which costs floor(n / 2) - i swaps.

const MAX_LEN = 12

export function parseInput(text) {
  const s = String(text).trim().replace(/^"|"$/g, '')
  if (!/^[a-z]+$/.test(s)) throw new Error('Use lowercase letters only, e.g. aabb.')
  if (s.length > MAX_LEN) throw new Error(`Use at most ${MAX_LEN} letters. The visualization caps the length there.`)
  return { s }
}

export const code = `FUNCTION minMovesToMakePalindrome(s)
    cs ← characters of s
    n ← length of s
    ans ← 0
    i ← 0, j ← n - 1
    WHILE i < j
        k ← search from j down to i + 1 for cs[k] = cs[i]
        IF found THEN
            move cs[k] to position j by adjacent swaps
            ans ← ans + (j - k)
            j ← j - 1
        ELSE
            ans ← ans + floor(n / 2) - i
        i ← i + 1
    RETURN ans`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def min_moves_to_make_palindrome(s):
    cs = list(s)
    n = len(cs)
    ans = 0
    i, j = 0, n - 1
    while i < j:
        k = j
        while k > i and cs[k] != cs[i]:
            k -= 1
        if k > i:
            while k < j:
                cs[k], cs[k + 1] = cs[k + 1], cs[k]
                k += 1
                ans += 1
            j -= 1
        else:
            ans += n // 2 - i
        i += 1
    return ans
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Ends', description: 'Two pointers start at the two ends of the string.' },
  { id: 'match', label: 'Match', description: 'Bring the match from the right to the right end.' },
  { id: 'odd', label: 'Odd letter', description: 'A letter with no match moves to the middle.' },
  { id: 'done', label: 'Result', description: 'The string is a palindrome.' },
]

export function buildTrace({ s }) {
  const cs = s.split('')
  const n = cs.length
  let ans = 0
  let i = 0
  let j = n - 1
  const frames = []
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({ phase, index: i, l: i, r: j, activeLine, pythonLine, message, cs: cs.slice(), ans, ...extra })
  push('start', L('i ← 0'), P('i, j = 0'), `Start with l at ${i} and r at ${j}.`)
  while (i < j) {
    let k = j
    while (k > i && cs[k] !== cs[i]) k -= 1
    if (k > i) {
      const moved = j - k
      while (k < j) { [cs[k], cs[k + 1]] = [cs[k + 1], cs[k]]; k += 1; ans += 1 }
      push('match', L('move cs[k] to position j'), P('cs[k], cs[k + 1]'),
        `${cs[j]} at the right end matches ${cs[i]} on the left; it moved ${moved} step(s). Moves ${ans}.`, { moved })
      j -= 1
    } else {
      const cost = Math.floor(n / 2) - i
      ans += cost
      push('odd', L('ans ← ans + floor'), P('ans += n // 2 - i'),
        `${cs[i]} has no match on the right, so it is the odd letter. It travels ${cost} step(s) to the middle. Moves ${ans}.`, { cost })
    }
    i += 1
  }
  push('done', L('RETURN ans'), P('return ans'), `The minimum number of moves is ${ans}. The string is now ${cs.join('')}.`, { result: ans })
  return { input: { s }, result: ans, frames }
}
