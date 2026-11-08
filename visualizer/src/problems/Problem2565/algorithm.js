export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s and t.')
  const { s, t } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 14 || !/^[a-z]+$/.test(s)) throw new Error('s has 1 to 14 lowercase letters.')
  if (typeof t !== 'string' || t.length < 1 || t.length > 12 || !/^[a-z]+$/.test(t)) throw new Error('t has 1 to 12 lowercase letters.')
  return { s, t }
}

export function buildTrace({ s, t }) {
  const m = t.length
  const n = s.length
  const frames = []
  const prefix = Array(m + 1).fill(null) // prefix[l]: s index after matching t[0..l) greedily
  const suffix = Array(m + 1).fill(null) // suffix[j]: s index where t[j..] can start matching
  prefix[0] = 0
  frames.push({ pythonLine: P('prefix[0] = 0'), phase: 'prefix', activeLine: L('prefix'), l: 0, j: -1, message: 'An empty prefix of t matches before index 0 of s.' })
  let k = 0
  for (let l = 1; l <= m; l++) {
    while (k < n && s[k] !== t[l - 1]) k++
    if (k === n) {
      frames.push({ pythonLine: P('if k == len(s):'), phase: 'prefix', activeLine: L('prefix[l] is the place'), l, j: -1, message: `t[0..${l}) cannot be matched in s, so longer prefixes fail too.` })
      break
    }
    k++
    prefix[l] = k
    frames.push({ pythonLine: P('prefix[l] = k'), phase: 'prefix', activeLine: L('prefix[l] is the place'), l, j: -1, message: `t[0..${l}) matches s up to index ${k - 1}.` })
  }
  if (prefix[m] !== null) {
    frames.push({ pythonLine: P('return 0'), phase: 'done', activeLine: L('if all of t matches'), l: m, j: -1, message: 't is already a subsequence of s, so the score is 0.' })
    return { input: { s, t }, result: 0, frames }
  }
  suffix[m] = n
  frames.push({ pythonLine: P('suffix[m] = len(s)'), phase: 'suffix', activeLine: L('suffix'), l: -1, j: m, message: 'The empty suffix of t starts at the end of s.' })
  k = n
  for (let j = m - 1; j >= 0; j--) {
    while (k > 0 && s[k - 1] !== t[j]) k--
    if (k === 0) {
      frames.push({ pythonLine: P('if k == 0:'), phase: 'suffix', activeLine: L('suffix[j] is the latest'), l: -1, j, message: `t[${j}..] cannot be matched from the right, so shorter suffixes fail too.` })
      break
    }
    k--
    suffix[j] = k
    frames.push({ pythonLine: P('suffix[j] = k'), phase: 'suffix', activeLine: L('suffix[j] is the latest'), l: -1, j, message: `t[${j}..] can start at index ${k} of s.` })
  }
  let best = m
  for (let l = 0; l <= m; l++) {
    if (prefix[l] === null) break
    for (let j = l; j <= m; j++) {
      if (suffix[j] !== null && prefix[l] <= suffix[j]) {
        const score = j - l
        if (score < best) best = score
        frames.push({ pythonLine: P('best = min(best, j - l)'), phase: 'pair', activeLine: L('best is the smaller of best'), l, j, message: `Remove t[${l}..${j}) for score ${score}; best is ${best}.` })
        break
      }
    }
  }
  frames.push({ pythonLine: P('return best'), phase: 'done', activeLine: L('return best'), l: -1, j: -1, message: `The minimum score is ${best}.` })
  return { input: { s, t }, result: best, frames }
}

export const code = `minimum score to make t a subsequence of s by removing characters
  prefix[l] is the place in s after matching the first l characters of t greedily
  if all of t matches then return 0
  suffix[j] is the latest place in s where t from j onward can start, found from the right
  best starts at the length of t
  for each prefix length l that matches
    find the smallest j at or after l whose suffix starts after prefix[l]
    best is the smaller of best and j minus l
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_score(s, t):
    m = len(t)
    prefix = [None] * (m + 1)
    prefix[0] = 0
    k = 0
    for l in range(1, m + 1):
        while k < len(s) and s[k] != t[l - 1]:
            k += 1
        if k == len(s):
            break
        k += 1
        prefix[l] = k
    if prefix[m] is not None:
        return 0
    suffix = [None] * (m + 1)
    suffix[m] = len(s)
    k = len(s)
    for j in range(m - 1, -1, -1):
        while k > 0 and s[k - 1] != t[j]:
            k -= 1
        if k == 0:
            break
        k -= 1
        suffix[j] = k
    best = m
    for l in range(m + 1):
        if prefix[l] is None:
            break
        for j in range(l, m + 1):
            if suffix[j] is not None and prefix[l] <= suffix[j]:
                best = min(best, j - l)
                break
    return best
`
const PY_LINES = python.split('\n')
const P = s => PY_LINES.findIndex(line => line.includes(s)) + 1
