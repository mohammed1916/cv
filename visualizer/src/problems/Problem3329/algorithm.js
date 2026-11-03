const LETTER = /^[a-z]+$/

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s and k.')
  const { s, k } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 20 || !LETTER.test(s)) throw new Error('s has 1 to 20 lowercase letters.')
  if (!Number.isInteger(k) || k < 1 || k > 10) throw new Error('k is an integer from 1 to 10.')
  return { s, k }
}

export const code = `count substrings where some character appears at least k times
  n = length of s
  counts = empty map from character to count
  left = 0
  bad = 0
  for right from 0 to n minus 1
    add s[right] to counts
    while counts[s[right]] is at least k
      remove s[left] from counts
      left = left + 1
    bad = bad + (right minus left plus 1)
  return n * (n + 1) / 2 minus bad`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def count_k_frequency(s, k):
    n = len(s)
    counts = {}
    left = 0
    bad = 0
    for right in range(n):
        counts[s[right]] = counts.get(s[right], 0) + 1
        while counts[s[right]] >= k:
            counts[s[left]] -= 1
            left += 1
        bad += right - left + 1
    return n * (n + 1) // 2 - bad
`

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}
const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export function buildTrace({ s, k }) {
  const frames = []
  const n = s.length
  const total = n * (n + 1) / 2
  const counts = {}
  let left = 0
  let bad = 0
  const snapshot = () => ({ ...counts })
  const push = (phase, codeText, pyText, message, extra = {}) => {
    frames.push({
      phase, activeLine: L(codeText), pythonLine: P(pyText), message,
      s, k, n, total, left, right: -1, bad, counts: snapshot(), good: 0, ...extra,
    })
  }

  push('start', 'n = length of s', 'n = len(s)', `The string has ${n} characters and ${total} substrings.`)
  for (let right = 0; right < n; right += 1) {
    const ch = s[right]
    counts[ch] = (counts[ch] || 0) + 1
    push('add', 'add s[right] to counts', 'counts[s[right]] = counts.get(s[right], 0) + 1', `Add '${ch}' at ${right}; it now appears ${counts[ch]} time${counts[ch] === 1 ? '' : 's'}.`, { right })
    while (counts[ch] >= k) {
      const leaving = s[left]
      counts[leaving] -= 1
      left += 1
      push('shrink', 'while counts[s[right]] is at least k', 'while counts[s[right]] >= k', `'${ch}' reached ${k}; drop '${leaving}' from the left so the window is all below k.`, { right, leaving })
    }
    const addedBad = right - left + 1
    bad += addedBad
    push('count', 'bad = bad + (right minus left plus 1)', 'bad += right - left + 1', `${addedBad} substring${addedBad === 1 ? '' : 's'} ending at ${right} have every count below k.`, { right, good: left })
  }

  const result = total - bad
  push('done', 'return n * (n + 1) / 2 minus bad', 'return n * (n + 1) // 2 - bad', `${total} substrings minus ${bad} with every count below k gives ${result}.`, { right: n - 1, result, done: true })
  return { input: { s, k }, result, frames }
}
