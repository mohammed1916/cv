// LeetCode 2168: Unique Substrings With Equal Digit Frequency.
// A substring qualifies when every digit it contains occurs the same number of times.
// Prefix counts of the ten digits give each substring's frequency vector in constant time.

const MAX_LEN = 12

export function parseInput(text) {
  const s = String(text).trim().replace(/^"|"$/g, '')
  if (!/^[0-9]+$/.test(s)) throw new Error('Use a string of digits, e.g. 1212.')
  if (s.length > MAX_LEN) throw new Error(`Use at most ${MAX_LEN} digits. The visualization caps the length at ${MAX_LEN}.`)
  return { s }
}

export const code = `FUNCTION equalDigitFrequency(s)
    n ← length of s
    presum ← (n + 1) by 10 table of zeros
    FOR i from 0 to n - 1
        presum[i + 1] ← presum[i] with one more count of digit s[i]
    seen ← empty set
    FOR l from 0 to n - 1
        FOR r from l to n - 1
            counts ← presum[r + 1] - presum[l]
            IF the nonzero counts in counts are all equal THEN
                add s[l..r] to seen
    RETURN size of seen`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def equal_digit_frequency(s):
    n = len(s)
    presum = [[0] * 10 for _ in range(n + 1)]
    for i, c in enumerate(s):
        presum[i + 1] = presum[i][:]
        presum[i + 1][int(c)] += 1
    seen = set()
    for l in range(n):
        for r in range(l, n):
            counts = {presum[r + 1][d] - presum[l][d] for d in range(10)} - {0}
            if len(counts) <= 1:
                seen.add(s[l:r + 1])
    return len(seen)
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
  { id: 'start', label: 'Prefix counts', description: 'Build the digit-count prefix table.' },
  { id: 'scan', label: 'Windows', description: 'Move the window [l, r] and read each digit count from the prefix table.' },
  { id: 'done', label: 'Result', description: 'The number of distinct qualifying substrings.' },
]

export function buildTrace({ s }) {
  const n = s.length
  const presum = [Array(10).fill(0)]
  for (let i = 0; i < n; i++) {
    const row = presum[i].slice()
    row[Number(s[i])] += 1
    presum.push(row)
  }
  const seen = new Set()
  const frames = []
  const push = (phase, l, r, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, l, r, index: l, activeLine, pythonLine, message, s, presum: presum.map(row => row.slice()), seen: [...seen], ...extra,
  })
  push('start', -1, -1, L('n ← length'), P('n = len(s)'), `${n} digits. The prefix table has ${n + 1} rows of ten digit counts.`)
  for (let l = 0; l < n; l++) {
    for (let r = l; r < n; r++) {
      const counts = Array.from({ length: 10 }, (_, d) => presum[r + 1][d] - presum[l][d])
      const nonzero = counts.filter(v => v > 0)
      const ok = new Set(nonzero).size <= 1
      const sub = s.slice(l, r + 1)
      let fresh = false
      if (ok && !seen.has(sub)) { seen.add(sub); fresh = true }
      const reason = nonzero.length === 0 ? 'no digits' : ok ? `all present digits appear ${nonzero[0]} time(s)` : 'digit counts differ'
      push('scan', l, r, L('IF the nonzero'), P('if len(counts)'),
        `Window ${sub}: ${reason}. ${ok ? (fresh ? 'New qualifying substring; the set grows.' : 'Qualifies, but already counted.') : 'Does not qualify.'}`,
        { counts, ok, fresh, sub })
    }
  }
  push('done', -1, -1, L('RETURN size'), P('return len(seen)'), `${seen.size} distinct substrings qualify.`)
  return { input: { s }, result: seen.size, frames }
}
