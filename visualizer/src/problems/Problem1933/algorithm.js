// LeetCode 1933: Check if String Is Decomposable Into Value-Equal Substrings.
// reach[i][t] means the prefix of length i splits into blocks with t length-2 blocks (t is 0 or 1).
// Blocks of length 2 or 3 must hold one repeated digit; the answer needs reach[n][1].

const DIGITS = /^[0-9]{1,20}$/

export function parseInput(text) {
  const s = String(text).trim()
  if (!DIGITS.test(s)) throw new Error('Enter 1 to 20 digits. The visualization caps the length at 20.')
  return { s }
}

export const code = `FUNCTION decomposable(s)
    reach[0][0] ← true; every other reach cell ← false
    FOR each start i from 0 to len(s) - 1
        FOR each count t in {0, 1} where reach[i][t] is true
            FOR each block length in {2, 3}
                IF s from i with that length fits and holds one repeated digit
                    used ← t plus 1 when the block length is 2
                    IF used ≤ 1 THEN reach[i + length][used] ← true
    RETURN reach[len(s)][1]`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def decomposable(s):
    n = len(s)
    reach = [[False, False] for _ in range(n + 1)]
    reach[0][0] = True
    for i in range(n):
        for t in (0, 1):
            if not reach[i][t]:
                continue
            for length in (2, 3):
                if i + length > n or len(set(s[i:i + length])) != 1:
                    continue
                used = t + (1 if length == 2 else 0)
                if used <= 1:
                    reach[i + length][used] = True
    return reach[n][1]
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
  { id: 'start', label: 'Start', description: 'The empty prefix is reachable.' },
  { id: 'scan', label: 'Scan', description: 'Start a block at this index.' },
  { id: 'try', label: 'Try block', description: 'Test a block of length 2 or 3.' },
  { id: 'done', label: 'Result', description: 'Check whether the whole string ends with exactly one length-2 block.' },
]

export function buildTrace({ s }) {
  const n = s.length
  const reach = Array.from({ length: n + 1 }, () => [false, false])
  reach[0][0] = true
  const frames = []
  const snap = () => reach.map(row => row.slice())
  frames.push({ phase: 'start', activeLine: L('reach[0][0]'), pythonLine: P('reach[0][0] = True'), message: 'The empty prefix is reachable with zero length-2 blocks.', i: -1, twos: -1, length: 0, ok: null, reach: snap() })
  for (let i = 0; i < n; i++) {
    frames.push({ phase: 'scan', activeLine: L('FOR each start i'), pythonLine: P('for i in range(n)'), message: `Start a block at index ${i}.`, i, twos: -1, length: 0, ok: null, reach: snap() })
    for (const t of [0, 1]) {
      if (!reach[i][t]) continue
      for (const length of [2, 3]) {
        const fits = i + length <= n
        const uniform = fits && s.slice(i, i + length).split('').every(c => c === s[i])
        const used = t + (length === 2 ? 1 : 0)
        const ok = uniform && used <= 1
        let message
        if (!fits) message = `A block of length ${length} runs past the end.`
        else if (!uniform) message = `s[${i}..${i + length - 1}] is not one repeated digit.`
        else if (used > 1) message = `A second length-2 block would break the rule.`
        else message = `s[${i}..${i + length - 1}] is valid; reach[${i + length}][${used}] becomes true.`
        if (ok) reach[i + length][used] = true
        frames.push({ phase: 'try', activeLine: L(ok ? 'IF used ≤ 1' : 'IF s from i'), pythonLine: P(ok ? 'reach[i + length][used] = True' : 'if i + length > n'), message, i, twos: t, length, ok, reach: snap() })
      }
    }
  }
  const result = reach[n][1]
  frames.push({ phase: 'done', activeLine: L('RETURN reach'), pythonLine: P('return reach[n][1]'), message: result ? 'The whole string ends with exactly one length-2 block.' : 'No split uses exactly one length-2 block.', i: n, twos: 1, length: 0, ok: result, reach: snap() })
  return { input: { s }, result, frames }
}
