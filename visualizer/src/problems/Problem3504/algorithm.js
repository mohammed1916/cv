export const code = `longest palindrome from a piece of s followed by a piece of t
  read t backwards and call it r
  expand around every center of s: g1[i] is the longest palindrome starting at i
  expand around every center of r: g2[j] is the longest palindrome starting at j
  start the answer at the largest value in g1 or g2
  for every pair of positions i in s and j in r
    compare the characters just before i and j
    if they match, grow the matched run: f[i][j] = f[i-1][j-1] + 1
    the run is mirrored outside, so try 2 * f[i][j] + the longer of g1[i] and g2[j]
  return the answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Pseudocode line missing: ${key}`)
  return index + 1
}

export const python = `def longest_palindrome(s, t):
    r = t[::-1]

    def palindrome_starts(text):
        best = [0] * (len(text) + 1)
        for center in range(2 * len(text) - 1):
            left, right = center // 2, (center + 1) // 2
            while left >= 0 and right < len(text) and text[left] == text[right]:
                best[left] = max(best[left], right - left + 1)
                left -= 1
                right += 1
        return best

    g1 = palindrome_starts(s)
    g2 = palindrome_starts(r)
    answer = max(max(g1), max(g2))
    f = [[0] * (len(r) + 1) for _ in range(len(s) + 1)]
    for i in range(1, len(s) + 1):
        for j in range(1, len(r) + 1):
            if s[i - 1] == r[j - 1]:
                f[i][j] = f[i - 1][j - 1] + 1
                answer = max(answer, 2 * f[i][j] + max(g1[i], g2[j]))
    return answer
`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Python line missing: ${key}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Reverse', description: 'Read t backwards so that mirrored pairs become equal runs.' },
  { id: 'expand', label: 'Expand', description: 'Grow palindromes outward from each center.' },
  { id: 'seed', label: 'Seed', description: 'A palindrome from one string alone is already an answer.' },
  { id: 'compare', label: 'Compare', description: 'Check one pair of characters.' },
  { id: 'match', label: 'Match', description: 'Extend the run ending at this pair.' },
  { id: 'candidate', label: 'Candidate', description: 'Wrap the run around a palindromic core.' },
  { id: 'done', label: 'Result', description: 'Report the longest palindrome found.' },
]

export const inputLabel = 'Object with lowercase strings s and t'
export const complexity = 'O(n^2 + m^2) for the center expansion and O(n m) for the matching table, with O(n m) space. The official length is up to 1000; the visualization caps each string at 12 characters.'
export const examples = [
  { label: 'Core in s', input: '{"s":"tenoon","t":"xnet"}' },
  { label: 'Core in t', input: '{"s":"racxy","t":"zcar"}' },
  { label: 'No shared letter', input: '{"s":"kl","t":"mn"}' },
  { label: 'All from t', input: '{"s":"q","t":"level"}' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s and t.')
  const { s, t } = input
  for (const [name, value] of [['s', s], ['t', t]]) {
    if (typeof value !== 'string' || value.length < 1 || value.length > 12) throw new Error(`${name} needs 1 to 12 characters here.`)
    if (!/^[a-z]+$/.test(value)) throw new Error(`${name} uses lowercase English letters only.`)
  }
  return { s, t }
}

const reverse = text => [...text].reverse().join('')

export function buildTrace({ s, t }) {
  const r = reverse(t)
  const n = s.length
  const m = r.length
  const frames = []
  const g1 = new Array(n + 1).fill(0)
  const g2 = new Array(m + 1).fill(0)
  const f = Array.from({ length: n + 1 }, (_, i) => Array.from({ length: m + 1 }, (_, j) => (i === 0 || j === 0 ? 0 : null)))
  let best = null
  const push = (phase, lineKey, pyKey, message, extra = {}) => frames.push({
    phase, activeLine: L(lineKey), pythonLine: PY(pyKey), message,
    g1: [...g1], g2: [...g2], f: f.map(row => [...row]), best: best && { ...best },
    which: null, left: null, right: null, cell: null, candidate: null, ...extra,
  })

  push('start', 'read t backwards', 'r = t[::-1]', `Reversing t gives "${r}". A mirrored pair now shows up as the same run of letters in s and r.`)

  const expandAll = (text, table, which) => {
    const label = which === 's' ? 's' : 'r'
    const lineKey = which === 's' ? 'center of s' : 'center of r'
    for (let center = 0; center < 2 * text.length - 1; center++) {
      let left = Math.floor(center / 2)
      let right = Math.floor((center + 1) / 2)
      while (left >= 0 && right < text.length && text[left] === text[right]) {
        table[left] = Math.max(table[left], right - left + 1)
        push('expand', lineKey, 'best[left] = max', `In ${label}, "${text.slice(left, right + 1)}" is a palindrome, so one of length ${right - left + 1} starts at ${left}.`, { which, left, right })
        left--
        right++
      }
      if (left >= 0 && right < text.length) {
        push('expand', lineKey, 'while left >= 0', `In ${label}, ${text[left]} at ${left} differs from ${text[right]} at ${right}; this center can grow no further.`, { which, left, right, blocked: true })
      }
    }
  }
  expandAll(s, g1, 's')
  expandAll(r, g2, 'r')

  const top1 = Math.max(...g1)
  const top2 = Math.max(...g2)
  if (top1 >= top2) {
    const at = g1.indexOf(top1)
    best = { length: top1, a: s.slice(at, at + top1), b: '', outer: 0, coreIn: 's' }
  } else {
    const at = g2.indexOf(top2)
    best = { length: top2, a: '', b: reverse(r.slice(at, at + top2)), outer: 0, coreIn: 'r' }
  }
  push('seed', 'start the answer', 'answer = max(max(g1)', `Using one string alone, the best palindrome is "${best.a || best.b}", length ${best.length}.`)

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const equal = s[i - 1] === r[j - 1]
      if (!equal) {
        f[i][j] = 0
        push('compare', 'compare the characters', 'if s[i - 1] == r[j - 1]', `s[${i - 1}] is ${s[i - 1]} and r[${j - 1}] is ${r[j - 1]}: different, so no run ends here.`, { cell: [i, j] })
        continue
      }
      push('compare', 'compare the characters', 'if s[i - 1] == r[j - 1]', `s[${i - 1}] and r[${j - 1}] are both ${s[i - 1]}.`, { cell: [i, j] })
      f[i][j] = f[i - 1][j - 1] + 1
      const run = f[i][j]
      push('match', 'if they match', 'f[i][j] = f[i - 1][j - 1] + 1', `The run ending here is ${f[i - 1][j - 1]} + 1 = ${run} long: "${s.slice(i - run, i)}".`, { cell: [i, j], run })

      const coreIn = g1[i] >= g2[j] ? 's' : 'r'
      const core = coreIn === 's' ? g1[i] : g2[j]
      const value = 2 * run + core
      const outer = s.slice(i - run, i)
      const a = coreIn === 's' ? s.slice(i - run, i + core) : outer
      const b = coreIn === 's' ? reverse(outer) : reverse(r.slice(j - run, j + core))
      const candidate = { i, j, run, core, coreIn, value, a, b }
      const improves = value > best.length
      if (improves) best = { length: value, a, b, outer: run, coreIn }
      push('candidate', 'the run is mirrored', 'answer = max(answer, 2', `"${a}" + "${b}" has length 2 × ${run} + ${core} = ${value}${improves ? ', the longest so far' : `, no better than ${best.length}`}.`, { cell: [i, j], run, candidate, improved: improves })
    }
  }

  push('done', 'return the answer', 'return answer', `The longest palindrome has length ${best.length}: "${best.a}" from s and "${best.b}" from t.`)
  return { input: { s, t, r }, result: best.length, frames }
}
