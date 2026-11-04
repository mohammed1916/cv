export const phases = [
  { id: 'start', label: 'Start', description: 'Equal lengths are required. Each character that must shift by d needs a move numbered d, d + 26, d + 52, and so on.' },
  { id: 'inspect', label: 'Inspect position', description: 'Find the shift needed at this position, and how many earlier positions already claimed that shift.' },
  { id: 'schedule', label: 'Schedule move', description: 'Give this position the next move number for its shift, and check it against k.' },
  { id: 'reject', label: 'Budget exceeded', description: 'The scheduled move number is larger than k, so the conversion is impossible.' },
  { id: 'done', label: 'Complete', description: 'Every shifted position received a move within the budget.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"s": "abc", "t": "bcd", "k": 60}.')
  const { s, t, k } = input
  if (typeof s !== 'string' || typeof t !== 'string' || !/^[a-z]{0,40}$/.test(s) || !/^[a-z]{0,40}$/.test(t)) throw new Error('s and t are lowercase letter strings of up to 40 characters.')
  if (!Number.isInteger(k) || k < 0 || k > 1000000000) throw new Error('k is an integer from 0 to 1000000000.')
  return { s, t, k }
}

export function buildTrace({ s, t, k }) {
  const frames = []
  const input = { s, t, k }
  const counts = {}
  const snap = (i, shift, occurrence, move, extra = {}) => ({ i, shift, occurrence, move, k, counts: { ...counts }, ...extra })
  frames.push({ phase: 'start', activeLine: L('if (s.length !== t.length)'), pythonLine: P('if len(s) != len(t)'), snapshot: snap(null, null, null, null), message: s.length !== t.length ? 'The lengths differ, so no sequence of moves can convert s into t.' : `Each shifted position claims the next move number for its shift, within k = ${k}.` })
  if (s.length !== t.length) {
    frames.push({ phase: 'reject', activeLine: L('k) return false'), pythonLine: P('return False'), snapshot: snap(null, null, null, null, { result: false }), message: 'The answer is false.' })
    return { input, result: false, frames }
  }
  for (let i = 0; i < s.length; i++) {
    const shift = (t.charCodeAt(i) - s.charCodeAt(i) + 26) % 26
    if (shift === 0) {
      frames.push({ phase: 'inspect', activeLine: L('if (shift === 0)'), pythonLine: P('if shift == 0'), snapshot: snap(i, 0, null, null), message: `Position ${i} already matches, so it needs no move.` })
      continue
    }
    const occurrence = counts[shift] ?? 0
    const move = shift + 26 * occurrence
    frames.push({ phase: 'inspect', activeLine: L('j = used'), pythonLine: P('j = used'), snapshot: snap(i, shift, occurrence, move), message: `Position ${i} needs shift ${shift}. ${occurrence} earlier position(s) already use this shift.` })
    if (move > k) {
      frames.push({ phase: 'reject', activeLine: L('if (shift + 26 * j > k)'), pythonLine: P('if shift + 26 * j > k'), snapshot: snap(i, shift, occurrence, move, { result: false }), message: `Move ${move} is above k = ${k}, so the conversion fails.` })
      return { input, result: false, frames }
    }
    counts[shift] = occurrence + 1
    frames.push({ phase: 'schedule', activeLine: L('used.set(shift, j + 1)'), pythonLine: P('used[shift] = j + 1'), snapshot: snap(i, shift, occurrence, move), message: `Position ${i} takes move ${move}, which is within k = ${k}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return true'), pythonLine: P('return True'), snapshot: snap(null, null, null, null, { result: true }), message: 'Every shifted position has a move within the budget, so the answer is true.' })
  return { input, result: true, frames }
}

export const code = [
  "function canConvertString(s, t, k) {",
  "  if (s.length !== t.length) return false",
  "  const used = new Map()",
  "  for (let i = 0; i < s.length; i++) {",
  "    const shift = (t.charCodeAt(i) - s.charCodeAt(i) + 26) % 26",
  "    if (shift === 0) continue",
  "    const j = used.get(shift) ?? 0",
  "    if (shift + 26 * j > k) return false",
  "    used.set(shift, j + 1) }",
  "  return true }",
].map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def can_convert(s, t, k):
    if len(s) != len(t):
        return False
    used = {}
    for a, b in zip(s, t):
        shift = (ord(b) - ord(a)) % 26
        if shift == 0:
            continue
        j = used.get(shift, 0)
        if shift + 26 * j > k:
            return False
        used[shift] = j + 1
    return True
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
