// Distinct substrings: sort the suffixes; each suffix adds its new prefixes, i.e. its length minus the LCP with the previous suffix.
const JS_LINES = [
  { text: 'const n = s.length', py: 'n = len(s)' },
  { text: 'const starts = Array.from({ length: n }, (_, i) => i).sort((a, b) => (s.slice(a) < s.slice(b) ? -1 : 1))', py: 'starts = sorted' },
  { text: 'let distinct = 0', py: 'distinct = 0' },
  { text: 'for (let i = 0; i < n; i++) {', py: 'for i in range(n)' },
  { text: 'distinct += n - starts[i]', py: 'distinct += n - starts[i]' },
  { text: 'if (i > 0) distinct -= lcp(s, starts[i - 1], starts[i])', py: 'if i > 0' },
  { text: '}', py: null },
  { text: 'return distinct', py: 'return distinct' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `def countDistinct(s):
    n = len(s)
    starts = sorted(range(n), key=lambda i: s[i:])
    distinct = 0
    for i in range(n):
        distinct += n - starts[i]
        if i > 0:
            distinct -= lcp(s, starts[i - 1], starts[i])
    return distinct

def lcp(s, a, b):
    k = 0
    while a + k < len(s) and b + k < len(s) and s[a + k] == s[b + k]:
        k += 1
    return k
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return distinct')]))

export const phases = [
  { id: 'sort', label: 'Sort suffixes', description: 'Every suffix is listed; sorting puts shared beginnings next to each other.' },
  { id: 'add', label: 'New prefixes', description: 'A suffix contributes its length, minus the prefix it shares with the suffix before it.' },
  { id: 'done', label: 'Result', description: 'The sum of the new prefixes is the number of distinct substrings.' },
]

export const examples = [
  { label: 'Repeated pair', input: '"abab"' },
  { label: 'All distinct letters', input: '"abcd"' },
  { label: 'One letter repeated', input: '"aaa"' },
]

export const complexity = 'O(n^2 log n) time for this sorted-suffix method on n characters (the visual caps n at 16). Space is O(n^2) for the suffix strings.'

export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 16) throw new Error('Use a JSON string of 1 to 16 lowercase letters (visual cap).')
  if (!/^[a-z]+$/.test(s)) throw new Error('Use lowercase letters only.')
  return s
}

function lcp(s, a, b) {
  let k = 0
  while (a + k < s.length && b + k < s.length && s[a + k] === s[b + k]) k++
  return k
}

export function buildTrace(s) {
  const n = s.length
  const frames = []
  const starts = Array.from({ length: n }, (_, i) => i).sort((a, b) => (s.slice(a) < s.slice(b) ? -1 : 1))
  const rows = []
  let distinct = 0
  const snap = extra => ({ rows: [...rows], distinct, ...extra })
  frames.push({ phase: 'sort', activeLine: 2, index: -1, message: `Suffixes sorted: ${starts.map(i => s.slice(i)).join(', ')}.`, snapshot: snap({}) })
  for (let i = 0; i < n; i++) {
    const shared = i > 0 ? lcp(s, starts[i - 1], starts[i]) : 0
    const add = n - starts[i] - shared
    distinct += add
    rows.push({ start: starts[i], suffix: s.slice(starts[i]), shared, add })
    frames.push({ phase: 'add', activeLine: 5, index: i, message: `"${s.slice(starts[i])}" shares ${shared} with the previous suffix, so adds ${add}.`, snapshot: snap({}) })
  }
  frames.push({ phase: 'done', activeLine: 8, index: -1, result: distinct, message: `${distinct} distinct substrings.`, snapshot: snap({ result: distinct }) })
  return { input: s, result: distinct, frames }
}
