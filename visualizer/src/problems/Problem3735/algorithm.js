// Lexicographically smallest string after one reversal, version II.
// Exactly one operation: reverse a nonempty prefix or a nonempty suffix (length one is allowed, and does nothing).
// Every prefix and suffix choice is tried, and the smallest resulting string is kept.

const CODE_TEXT = `FUNCTION smallestAfterReverse(s)
    n ← length of s
    best ← s
    FOR k from 1 to n, reversing the prefix of length k
        candidate ← reverse(prefix) + rest
        IF candidate < best THEN best ← candidate
    FOR k from 1 to n, reversing the suffix of length k
        candidate ← head + reverse(suffix)
        IF candidate < best THEN best ← candidate
    RETURN best`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = key => {
  const index = code.findIndex(entry => entry.text.includes(key))
  if (index < 0) throw new Error(`Missing pseudocode line: ${key}`)
  return index + 1
}

export const python = `def smallest_after_reverse(s):
    n = len(s)
    best = s
    for k in range(1, n + 1):
        candidate = s[:k][::-1] + s[k:]
        if candidate < best:
            best = candidate
    for k in range(1, n + 1):
        candidate = s[:n - k] + s[n - k:][::-1]
        if candidate < best:
            best = candidate
    return best


if __name__ == "__main__":
    import json
    import sys
    print(json.dumps(smallest_after_reverse(json.loads(sys.stdin.read()))))
`

const PY_LINES = python.split('\n')
const P = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing python line: ${key}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Start', description: 'Keep the original string as the best so far.' },
  { id: 'prefix', label: 'Prefix', description: 'Reverse a prefix of length k and compare.' },
  { id: 'suffix', label: 'Suffix', description: 'Reverse a suffix of length k and compare.' },
  { id: 'done', label: 'Answer', description: 'Report the smallest string found.' },
]

export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 12) throw new Error('Use a JSON string of 1 to 12 lowercase letters.')
  if (!/^[a-z]+$/.test(s)) throw new Error('Use lowercase letters only.')
  return s
}

export function buildTrace(s) {
  const n = s.length
  const frames = []
  let best = s
  let bestBy = null
  const push = (phase, line, py, message, extra = {}) => frames.push({
    phase, activeLine: L(line), pythonLine: P(py), message, best, bestBy, candidate: null, span: null, k: 0, improved: false, ...extra,
  })
  push('start', 'best ← s', 'best = s', `Original string "${s}" is the best so far.`)
  for (let k = 1; k <= n; k += 1) {
    const candidate = s.slice(0, k).split('').reverse().join('') + s.slice(k)
    const improved = candidate < best
    if (improved) { best = candidate; bestBy = `prefix ${k}` }
    push('prefix', 'reversing the prefix of length k', 'candidate = s[:k][::-1] + s[k:]', `Reverse prefix of length ${k}: "${candidate}"${improved ? ' is the new best.' : '.'}`, { k, candidate, span: [0, k - 1], improved })
  }
  for (let k = 1; k <= n; k += 1) {
    const candidate = s.slice(0, n - k) + s.slice(n - k).split('').reverse().join('')
    const improved = candidate < best
    if (improved) { best = candidate; bestBy = `suffix ${k}` }
    push('suffix', 'reversing the suffix of length k', 'candidate = s[:n - k] + s[n - k:][::-1]', `Reverse suffix of length ${k}: "${candidate}"${improved ? ' is the new best.' : '.'}`, { k, candidate, span: [n - k, n - 1], improved })
  }
  push('done', 'RETURN best', 'return best', `Smallest result: "${best}" (${bestBy || 'no change'}).`, { best, bestBy })
  return { input: s, result: best, frames }
}
