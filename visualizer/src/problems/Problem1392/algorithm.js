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
  const PY_LINE = { 'make an array pi': 3, 'set k to 0': 4, 'for i from 1': 5, 'while k is above 0': 6, 'set k to pi[k - 1]': 7, 'if s[i] equals s[k]': 8, 'add 1 to k': 9, 'set pi[i] to k': 10, 'return the first': 11 }
  const snap = (phase, line, i, k, message) => frames.push({ phase, pythonLine: PY_LINE[line], activeLine: L(LINE_TEXT[line]), i, k, pi: [...pi], message })
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
  frames.push({ phase: 'done', pythonLine: 11, activeLine: L('return s.slice'), i: n, k: pi[n - 1], pi: [...pi], message: result ? `The longest happy prefix is "${result}".` : 'No proper prefix is also a suffix, so the answer is the empty string.' })
  return { input: s, result, frames }
}

const CODE = [
  'function longestHappyPrefix(s) {',
  '  const n = s.length',
  '  const pi = Array(n).fill(0)',
  '  let k = 0',
  '  for (let i = 1; i < n; i++) {',
  '    while (k > 0 && s[i] !== s[k]) k = pi[k - 1]',
  '    if (s[i] === s[k]) k++',
  '    pi[i] = k',
  '  }',
  '  return s.slice(0, pi[n - 1])',
  '}',
]
export const code = CODE.map((text, index) => ({ line: index + 1, text }))
const L = s => CODE.findIndex(text => text.includes(s)) + 1
const LINE_TEXT = { 'make an array pi': 'const pi', 'set k to 0': 'let k = 0', 'for i from 1': 'for (let i', 'while k is above 0': 'while (k > 0', 'set k to pi[k - 1]': 'k = pi[k - 1]', 'if s[i] equals s[k]': 'if (s[i] === s[k])', 'add 1 to k': 'if (s[i] === s[k])', 'set pi[i] to k': 'pi[i] = k', 'return the first': 'return s.slice' }

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
