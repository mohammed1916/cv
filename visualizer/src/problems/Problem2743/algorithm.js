// LeetCode 2743: Count Substrings Without Repeating Character.
// Sliding window: for each right end r, the window [left, r] holds distinct characters. Every
// substring ending at r that starts at or after left is valid, so it adds r - left + 1.
// Positions count even when their text is equal. The draft's bounds are unverified, so the
// visualization caps the string at 16 characters.

const MAX_VISUAL_LENGTH = 16

const PYTHON_SOURCE = `def count_substrings(s):
    left = 0
    last_seen = {}
    total = 0
    for r, c in enumerate(s):
        if c in last_seen and last_seen[c] >= left:
            left = last_seen[c] + 1
        last_seen[c] = r
        total += r - left + 1
    return total

if __name__ == "__main__":
    import sys, json
    print(count_substrings(json.loads(sys.stdin.read())))
`

export const code = `function countSubstrings(s) {
  let left = 0; const lastSeen = new Map(); let total = 0; // left ← 0; lastSeen ← empty map; total ← 0
  for (let r = 0; r < s.length; r++) { // FOR each right end r from 0 to length(s) - 1
    const c = s[r];
    if (lastSeen.has(c) && lastSeen.get(c) >= left) left = lastSeen.get(c) + 1; // IF c was last seen at index ≥ left THEN left ← lastSeen[c] + 1
    lastSeen.set(c, r);
    total += r - left + 1; // total ← total + (r - left + 1)
  }
  return total; // RETURN total
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}
const PY = PYTHON_SOURCE.split('\n')
const P = s => {
  const index = PY.findIndex(text => text.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export const python = PYTHON_SOURCE

export function parseInput(text) {
  const trimmed = text.trim()
  let s = trimmed
  if (trimmed.startsWith('"')) {
    s = JSON.parse(trimmed)
    if (typeof s !== 'string') throw new Error('A JSON input must be a string such as "abcab".')
  }
  if (s.length < 1) throw new Error('Enter a non-empty string.')
  return { s }
}

export function buildTrace({ s }) {
  if (s.length > MAX_VISUAL_LENGTH) throw new Error(`The visualization caps the string at ${MAX_VISUAL_LENGTH} characters.`)
  const frames = []
  const lastSeen = new Map()
  let left = 0
  let total = 0
  const ends = []

  frames.push({ phase: 'setup', pythonLine: P('left = 0'), activeLine: L('left ← 0'), left: 0, right: -1, c: null,
    lastSeen: {}, ends: [], total: 0, repeatAt: null, message: `Read ${s.length} character${s.length === 1 ? '' : 's'}; the window starts empty at index 0.` })

  for (let r = 0; r < s.length; r += 1) {
    const c = s[r]
    frames.push({ phase: 'extend', pythonLine: P('for r, c in enumerate'), activeLine: L('FOR each right end'), left, right: r, c,
      lastSeen: Object.fromEntries(lastSeen), ends: [...ends], total, repeatAt: null,
      message: `Extend the window to index ${r} with '${c}'.` })
    let repeatAt = null
    if (lastSeen.has(c) && lastSeen.get(c) >= left) {
      repeatAt = lastSeen.get(c)
      left = repeatAt + 1
      frames.push({ phase: 'shrink', pythonLine: P('left = last_seen[c] + 1'), activeLine: L('IF c was last seen'), left, right: r, c,
        lastSeen: Object.fromEntries(lastSeen), ends: [...ends], total, repeatAt,
        message: `'${c}' already sits at index ${repeatAt}, inside the window. Move left to ${left} so the window is distinct again.` })
    }
    lastSeen.set(c, r)
    const added = r - left + 1
    total += added
    ends.push(added)
    frames.push({ phase: 'count', pythonLine: P('total += r - left + 1'), activeLine: L('total ← total + (r - left + 1)'), left, right: r, c,
      lastSeen: Object.fromEntries(lastSeen), ends: [...ends], total, repeatAt,
      message: `${added} distinct substring${added === 1 ? '' : 's'} end at index ${r}. Running total ${total}.` })
  }
  frames.push({ phase: 'done', pythonLine: P('return total'), activeLine: L('RETURN total'), left, right: s.length - 1, c: null,
    lastSeen: Object.fromEntries(lastSeen), ends: [...ends], total, repeatAt: null, message: `Total of ${total} substring${total === 1 ? '' : 's'} without a repeated character.` })
  return { input: { s }, s, answer: total, frames }
}

export const pythonLineMap = {}
export const phases = [
  { id: 'setup', label: 'Start window', description: 'Empty window before the first character.' },
  { id: 'extend', label: 'Extend right', description: 'Add the character at the right end.' },
  { id: 'shrink', label: 'Shrink left', description: 'Jump left past an earlier copy of the character.' },
  { id: 'count', label: 'Count ends', description: 'Every start from left to r gives a valid substring.' },
  { id: 'done', label: 'Total', description: 'Report the count of valid positional substrings.' },
]
