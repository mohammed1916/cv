export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with lcp, a square matrix.')
  const { lcp } = input
  if (!Array.isArray(lcp) || lcp.length < 1 || lcp.length > 6) throw new Error('lcp is a square matrix of size 1 to 6.')
  const n = lcp.length
  if (!lcp.every(row => Array.isArray(row) && row.length === n && row.every(v => Number.isInteger(v) && v >= 0 && v <= n))) throw new Error('Each entry is an integer from 0 to n.')
  return { lcp }
}

export function buildTrace({ lcp }) {
  const n = lcp.length
  const frames = []
  const word = Array(n).fill('')
  let letters = 0
  frames.push({ pythonLine: P('word = [\'\'] * n'), phase: 'start', activeLine: L('give every index'), at: -1, word: [...word], message: 'Start with no letters assigned.' })
  for (let i = 0; i < n; i++) {
    if (word[i] !== '') continue
    if (letters === 26) {
      frames.push({ pythonLine: P('if letters == 26:'), phase: 'done', activeLine: L('more than 26 letters'), at: i, word: [...word], message: 'More than 26 letters would be needed.' })
      frames.push({ pythonLine: P("return ''"), phase: 'done', activeLine: L('return empty'), at: -1, word: [...word], message: 'No string has this LCP matrix.' })
      return { input: { lcp }, result: '', frames }
    }
    const c = String.fromCharCode(97 + letters)
    letters++
    for (let j = i; j < n; j++) {
      if (lcp[i][j] > 0 && word[j] === '') word[j] = c
    }
    frames.push({ pythonLine: P('for j in range(i, n):'), phase: 'assign', activeLine: L('give every index'), at: i, word: [...word], message: `Index ${i} starts letter ${c}; every index with a positive LCP gets it too.` })
  }
  const check = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (word[i] === word[j]) check[i][j] = check[i + 1][j + 1] + 1
    }
  }
  frames.push({ pythonLine: P('check = [[0]'), phase: 'verify', activeLine: L('compute the LCP of the word'), at: -1, word: [...word], message: 'Compute the LCP table of the candidate word.' })
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (check[i][j] !== lcp[i][j]) {
        frames.push({ pythonLine: P('if check[i][j] != lcp[i][j]:'), phase: 'done', activeLine: L('a cell disagrees'), at: i, word: [...word], message: `Cell (${i}, ${j}) is ${check[i][j]} but should be ${lcp[i][j]}.` })
        frames.push({ pythonLine: PLAST("return ''"), phase: 'done', activeLine: L('return empty'), at: -1, word: [...word], message: 'The candidate does not match, so no string works.' })
        return { input: { lcp }, result: '', frames }
      }
    }
  }
  const result = word.join('')
  frames.push({ pythonLine: P("return ''.join(word)"), phase: 'done', activeLine: L('return the word'), at: -1, word: [...word], message: `Every cell agrees. The word is ${result}.` })
  return { input: { lcp }, result, frames }
}

export const code = `find a word whose LCP table is the given matrix
  word is n empty slots
  for each index i with no letter yet
    if 26 letters are used then return empty
    give i a new letter
    every index j at or after i with lcp[i][j] above zero gets the same letter
  compute the LCP table of the word from the bottom right
  if any cell differs from lcp then return empty
  return the word`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def find_string(lcp):
    n = len(lcp)
    word = [''] * n
    letters = 0
    for i in range(n):
        if word[i] == '':
            if letters == 26:
                return ''
            c = chr(ord('a') + letters)
            letters += 1
            for j in range(i, n):
                if lcp[i][j] > 0 and word[j] == '':
                    word[j] = c
    check = [[0] * (n + 1) for _ in range(n + 1)]
    for i in range(n - 1, -1, -1):
        for j in range(n - 1, -1, -1):
            if word[i] == word[j]:
                check[i][j] = check[i + 1][j + 1] + 1
    for i in range(n):
        for j in range(n):
            if check[i][j] != lcp[i][j]:
                return ''
    return ''.join(word)
`
const PY_LINES = python.split('\n')
const P = s => PY_LINES.findIndex(line => line.includes(s)) + 1
const PLAST = s => PY_LINES.length - [...PY_LINES].reverse().findIndex(line => line.trim() === s)
