const PATTERN = /^[TF]+$/
const LETTERS = /^[a-z]+$/

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with str1 and str2.')
  const { str1, str2 } = input
  if (typeof str1 !== 'string' || str1.length < 1 || str1.length > 8 || !PATTERN.test(str1)) throw new Error('str1 has 1 to 8 letters, each T or F.')
  if (typeof str2 !== 'string' || str2.length < 1 || str2.length > 4 || !LETTERS.test(str2)) throw new Error('str2 has 1 to 4 lowercase letters.')
  return { str1, str2 }
}

export function buildTrace({ str1, str2 }) {
  const n = str1.length
  const m = str2.length
  const size = n + m - 1
  const word = Array(size).fill('a')
  const fixed = Array(size).fill(false)
  const frames = []
  const snap = (window, kind, extra = {}) => ({ window, kind, word: [...word], fixed: [...fixed], ...extra })
  frames.push({ ...snap(-1, ''), pythonLine: P('word = '), phase: 'start', activeLine: L('const word = Array'), ok: null, message: `Build ${size} letters, all a to begin with.` })
  for (let i = 0; i < n; i++) {
    if (str1[i] !== 'T') continue
    frames.push({ ...snap(i, 'T'), pythonLine: P('for i in range(n)'), phase: 'force', activeLine: L("str1[i] !== 'T'"), ok: null, message: `T at ${i} forces str2 onto positions ${i} to ${i + m - 1}.` })
    for (let j = 0; j < m; j++) {
      const p = i + j
      if (fixed[p] && word[p] !== str2[j]) {
        frames.push({ ...snap(i, 'T', { at: p }), pythonLine: P('return'), phase: 'fail', activeLine: L('if (fixed[i + j] && word[i + j]'), ok: false, message: `Index ${p} is already ${word[p]}, so it cannot be ${str2[j]}.` })
        return { input: { str1, str2 }, result: '', frames }
      }
      word[p] = str2[j]
      fixed[p] = true
    }
    frames.push({ ...snap(i, 'T', { at: -1 }), pythonLine: P('fixed[i + j] = True'), phase: 'force', activeLine: L('fixed[i + j] = true'), ok: null, message: `Window ${i} now reads ${str2}.` })
  }
  for (let i = 0; i < n; i++) {
    if (str1[i] !== 'F') continue
    const equal = [...str2].every((c, j) => word[i + j] === c)
    frames.push({ ...snap(i, 'F'), pythonLine: P('if str1[i] == \'F\''), phase: 'check', activeLine: L("!== 'F' ||"), ok: null, message: equal ? `Window ${i} equals str2 and must change.` : `Window ${i} already differs from str2.` })
    if (!equal) continue
    let k = i + m - 1
    while (k >= i && fixed[k]) k--
    if (k < i) {
      frames.push({ ...snap(i, 'F'), pythonLine: P('return'), phase: 'fail', activeLine: L('if (k < i) return'), ok: false, message: `Window ${i} equals str2 and has no free position to change.` })
      return { input: { str1, str2 }, result: '', frames }
    }
    word[k] = 'b'
    fixed[k] = true
    frames.push({ ...snap(i, 'F', { at: k }), pythonLine: P('word[free] = '), phase: 'fix', activeLine: L("word[k] = 'b'"), ok: null, message: `Change index ${k} to b so window ${i} differs.` })
  }
  const result = word.join('')
  frames.push({ ...snap(-1, ''), pythonLine: P('return'), phase: 'done', activeLine: L('return word.join'), ok: true, message: `Smallest word: ${result}.` })
  return { input: { str1, str2 }, result, frames }
}

export const code = `function smallestGenerated(str1, str2) {
  const n = str1.length
  const m = str2.length
  const word = Array(n + m - 1).fill('a')
  const fixed = Array(n + m - 1).fill(false)
  for (let i = 0; i < n; i++) {
    if (str1[i] !== 'T') continue
    for (let j = 0; j < m; j++) {
      if (fixed[i + j] && word[i + j] !== str2[j]) return ''
      word[i + j] = str2[j]
      fixed[i + j] = true
    }
  }
  for (let i = 0; i < n; i++) {
    if (str1[i] !== 'F' || word.slice(i, i + m).join('') !== str2) continue
    let k = i + m - 1
    while (k >= i && fixed[k]) k--
    if (k < i) return ''
    word[k] = 'b'
    fixed[k] = true
  }
  return word.join('')
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def smallest_generated(str1, str2):
    n, m = len(str1), len(str2)
    word = ['a'] * (n + m - 1)
    fixed = [False] * (n + m - 1)
    for i in range(n):
        if str1[i] == 'T':
            for j in range(m):
                if fixed[i + j] and word[i + j] != str2[j]:
                    return ''
                word[i + j] = str2[j]
                fixed[i + j] = True
    for i in range(n):
        if str1[i] == 'F' and word[i:i + m] == list(str2):
            free = [k for k in range(i + m - 1, i - 1, -1) if not fixed[k]]
            if not free:
                return ''
            word[free[0]] = 'b'
            fixed[free[0]] = True
    return ''.join(word)
`
const P = s => python.split('\n').findIndex(line => line.includes(s)) + 1
