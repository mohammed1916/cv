export const phases = [
  { id: 'start', label: 'Count needed codes', description: 'There are 2^k binary codes of length k. Compare that number with the number of windows available.' },
  { id: 'inspect', label: 'Read window', description: 'Take the length-k substring starting at the current position.' },
  { id: 'update', label: 'Record code', description: 'Add the window to the set of distinct codes seen; stop early when every code has appeared.' },
  { id: 'done', label: 'Complete', description: 'Return true when all 2^k codes were seen, otherwise false.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"s": "0110", "k": 2}.')
  const { s, k } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 300 || !/^[01]+$/.test(s)) throw new Error('s is 1 to 300 characters, each 0 or 1.')
  if (!Number.isInteger(k) || k < 1 || k > 12) throw new Error('k is an integer from 1 to 12 in this visualizer.')
  return { s, k }
}

export function buildTrace({ s, k }) {
  const needed = 2 ** k
  const windows = s.length - k + 1
  const seen = new Set()
  const snap = (start, extra = {}) => ({ s, k, needed, windows, start, seen: [...seen], ...extra })
  const frames = [{ phase: 'start', activeLine: L('needed = 2 ** k'), pythonLine: P('needed = 1 << k'), snapshot: snap(null), message: `Length ${k} has ${needed} codes. The string has ${windows} windows of that length.` }]
  if (windows < needed) {
    frames.push({ phase: 'done', activeLine: L('if len(s) - k + 1 < needed'), pythonLine: P('if len(s) - k + 1 < needed'), snapshot: snap(null, { reason: 'short' }), message: `${windows} windows cannot cover ${needed} distinct codes, so the answer is false without scanning.` })
    return { input: { s, k }, result: false, frames }
  }
  for (let start = 0; start <= s.length - k; start++) {
    const code = s.slice(start, start + k)
    frames.push({ phase: 'inspect', activeLine: L('for start from 0'), pythonLine: P('for start in range'), snapshot: snap(start, { window: code }), message: `Window at ${start} is "${code}".` })
    seen.add(code)
    if (seen.size === needed) {
      frames.push({ phase: 'done', activeLine: L('return true'), pythonLine: P('return True'), snapshot: snap(start, { window: code }), message: `All ${needed} codes have appeared by position ${start}, so return true.` })
      return { input: { s, k }, result: true, frames }
    }
    frames.push({ phase: 'update', activeLine: L('seen.add'), pythonLine: P('seen.add'), snapshot: snap(start, { window: code }), message: `Recorded "${code}". ${seen.size} of ${needed} codes seen so far.` })
  }
  frames.push({ phase: 'done', activeLine: L('return len(seen)'), pythonLine: P('return len(seen)'), snapshot: snap(null, { window: null }), message: `Only ${seen.size} of ${needed} codes appeared, so return false.` })
  return { input: { s, k }, result: false, frames }
}

export const code = `contains all binary codes (s, k):
  needed = 2 ** k
  if len(s) - k + 1 < needed: return false
  seen = empty set
  for start from 0 to len(s) - k:
    seen.add(s[start:start + k])
    if len(seen) == needed: return true
  return len(seen) == needed`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def has_all_codes(s, k):
    needed = 1 << k
    if len(s) - k + 1 < needed:
        return False
    seen = set()
    for start in range(len(s) - k + 1):
        seen.add(s[start:start + k])
        if len(seen) == needed:
            return True
    return len(seen) == needed
`
