export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 40) throw new Error('Use a JSON string of 1 to 40 characters.')
  if (!/^[a-z]+$/.test(s)) throw new Error('Use lowercase letters a to z only.')
  return s
}

export function buildTrace(s) {
  const n = s.length
  const pi = Array(n).fill(0)
  const frames = []
  const snap = (phase, line, i, k, message) => frames.push({ phase, activeLine: L(line), i, k, pi: [...pi], message })
  snap('start', 'make an array pi', -1, 0, `The prefix function pi[i] is the length of the longest proper prefix of s[0..i] that is also a suffix.`)
  let k = 0
  snap('start', 'set k to 0', -1, k, 'No border has been found yet, so the matched length k starts at 0.')
  for (let i = 1; i < n; i++) {
    snap('scan', 'for i from 1', i, k, `Look at position ${i} ('${s[i]}') and try to extend the border of length ${k}.`)
    while (k > 0 && s[i] !== s[k]) {
      snap('fall', 'set k to pi[k - 1]', i, k, `'${s[i]}' does not match s[${k}] = '${s[k]}'. Fall back to the border of length ${pi[k - 1]}.`)
      k = pi[k - 1]
      snap('fall', 'while k is above 0', i, k, `Compare '${s[i]}' with s[${k}] = '${s[k]}' again.`)
    }
    if (s[i] === s[k]) {
      k++
      snap('match', 'add 1 to k', i, k, `'${s[i]}' matches s[${k - 1}]. The border grows to length ${k}.`)
    } else {
      snap('match', 'if s[i] equals s[k]', i, k, `No border can be extended at ${i}; the border length stays 0.`)
    }
    pi[i] = k
    snap('record', 'set pi[i] to k', i, k, `pi[${i}] = ${k}.`)
  }
  const result = s.slice(0, pi[n - 1])
  frames.push({ phase: 'done', activeLine: L('return the first'), i: n, k: pi[n - 1], pi: [...pi], message: result ? `The longest happy prefix is "${result}".` : 'No proper prefix is also a suffix, so the answer is the empty string.' })
  return { input: s, result, frames }
}

export const code = `longest happy prefix of s:
  set n to the length of s
  make an array pi of n zeros
  set k to 0
  for i from 1 to n - 1:
    while k is above 0 and s[i] differs from s[k]:
      set k to pi[k - 1]
    if s[i] equals s[k] then
      add 1 to k
    set pi[i] to k
  return the first pi[n - 1] characters of s`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def longest_happy_prefix(s):
    n = len(s)
    pi = [0] * n
    k = 0
    for i in range(1, n):
        while k > 0 and s[i] != s[k]:
            k = pi[k - 1]
        if s[i] == s[k]:
            k += 1
        pi[i] = k
    return s[:pi[n - 1]]
`
