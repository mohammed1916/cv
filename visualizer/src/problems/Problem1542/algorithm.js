export const phases = [
  { id: 'start', label: 'Start', description: 'A substring can become a palindrome when at most one digit has an odd count. Store each prefix parity mask at its earliest index.' },
  { id: 'prefix', label: 'Extend prefix', description: 'Flip the parity bit of the new digit to get the mask of the prefix ending here.' },
  { id: 'check', label: 'Match masks', description: 'Look up the current mask and the eleven masks that differ from it by at most one bit.' },
  { id: 'record', label: 'Longer substring', description: 'A match gives a longer substring than the best so far.' },
  { id: 'done', label: 'Complete', description: 'The best length is the answer.' },
]

export function parseInput(text) {
  const s = text.trim()
  if (!/^[0-9]{1,40}$/.test(s)) throw new Error('Enter a string of 1 to 40 digits.')
  return s
}

export function buildTrace(s) {
  const frames = []
  const first = new Map([[0, 0]])
  let mask = 0
  let best = 0
  let span = [0, 0]
  const snap = (r, extra = {}) => ({ r, mask, best, span, ...extra })
  frames.push({ phase: 'start', activeLine: L('const first = new Map([[0, 0]])'), pythonLine: P('first = {0: 0}'), snapshot: snap(0, { hits: [] }), message: 'The empty prefix has mask 0 at index 0. Record each new mask at its first appearance.' })
  for (let r = 1; r <= s.length; r++) {
    const digit = Number(s[r - 1])
    mask ^= 1 << digit
    frames.push({ phase: 'prefix', activeLine: L('mask ^='), pythonLine: P('mask ^='), snapshot: snap(r, { hits: [] }), message: `Digit ${digit} flips its parity bit. The prefix of length ${r} has mask ${mask.toString(2).padStart(10, '0')}.` })
    const targets = [mask, ...Array.from({ length: 10 }, (_, d) => mask ^ (1 << d))]
    const hits = []
    for (const target of targets) {
      if (first.has(target)) hits.push({ target, start: first.get(target), length: r - first.get(target) })
    }
    frames.push({ phase: 'check', activeLine: L('for (const target of'), pythonLine: P('for target in'), snapshot: snap(r, { hits }), message: hits.length ? `${hits.length} earlier prefix(es) pair with this end; the longest gives length ${Math.max(...hits.map(h => h.length))}.` : 'No earlier prefix pairs with this end.' })
    for (const hit of hits) {
      if (hit.length > best) {
        best = hit.length
        span = [hit.start, r]
        frames.push({ phase: 'record', activeLine: L('best = Math.max'), pythonLine: P('best = max'), snapshot: snap(r, { hits }), message: `Substring from ${hit.start} to ${r} has length ${best} and can be rearranged into a palindrome.` })
      }
    }
    if (!first.has(mask)) first.set(mask, r)
  }
  frames.push({ phase: 'done', activeLine: L('return best'), pythonLine: P('return best'), snapshot: snap(s.length, { hits: [] }), message: `The longest palindromable digit substring has length ${best}.` })
  return { input: s, result: best, frames }
}

export const code = [
  "function longestPalindromable(s) {",
  "  const first = new Map([[0, 0]])",
  "  let mask = 0, best = 0",
  "  for (let r = 1; r <= s.length; r++) {",
  "    mask ^= 1 << Number(s[r - 1])",
  "    const targets = [mask, ...Array.from({ length: 10 }, (_, d) => mask ^ (1 << d))]",
  "    for (const target of targets) {",
  "      if (first.has(target)) best = Math.max(best, r - first.get(target)) }",
  "    if (!first.has(mask)) first.set(mask, r) }",
  "  return best }",
].map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def longest_awesome(s):
    first = {0: 0}
    mask, best = 0, 0
    for r, ch in enumerate(s, 1):
        mask ^= 1 << int(ch)
        for target in [mask] + [mask ^ (1 << d) for d in range(10)]:
            if target in first:
                best = max(best, r - first[target])
        first.setdefault(mask, r)
    return best
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
