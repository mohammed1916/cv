export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || !/^\([0-9]{2,7}\)$/.test(s)) throw new Error('Enter a JSON string like "(123)": parentheses around 2-7 digits (visualization cap).')
  return s
}
export function validLeft(t) { return t === '0' || !t.startsWith('0') }
export function makeNumbers(t) {
  const out = []
  for (let d = 1; d <= t.length; d++) {
    const left = t.slice(0, d), right = t.slice(d)
    if (validLeft(left) && !right.endsWith('0')) out.push(left + (right ? '.' : '') + right)
  }
  return out
}
export function buildTrace(input) {
  const s = input.slice(1, -1)
  const frames = []
  const res = []
  const push = (phase, activeLine, message, extra = {}) => frames.push({ phase, activeLine, message, digits: s, res: [...res], split: -1, leftOpts: [], rightOpts: [], ...extra })
  push('start', 2, `Drop the parentheses: digits "${s}". Choose where the comma goes, then optionally a decimal point inside each number.`)
  for (let i = 1; i < s.length; i++) {
    const a = s.slice(0, i), b = s.slice(i)
    push('split', 11, `Comma after ${i} digit${i > 1 ? 's' : ''}: left digits "${a}", right digits "${b}".`, { split: i })
    const L = makeNumbers(a), R = makeNumbers(b)
    push('make', 12, `Legal numbers for "${a}": ${L.length ? L.join(', ') : 'none'}. For "${b}": ${R.length ? R.join(', ') : 'none'}. (No leading zeros like 01; no trailing zeros after the point like 1.0; a lone 0 is fine.)`, { split: i, leftOpts: L, rightOpts: R })
    for (const x of L) for (const y of R) res.push(`(${x}, ${y})`)
    push('combine', 14, L.length && R.length ? `Pair every left with every right: ${L.length} x ${R.length} = ${L.length * R.length} coordinates. Total so far: ${res.length}.` : `One side has no legal number, so this split yields nothing. Total so far: ${res.length}.`, { split: i, leftOpts: L, rightOpts: R })
  }
  push('done', 15, `${res.length} possible original coordinates.`)
  return { input, result: res, frames }
}
export const code = `def ambiguousCoordinates(s):
    s = s[1:-1]
    def make(t):
        out = []
        for d in range(1, len(t) + 1):
            left, right = t[:d], t[d:]
            if (left == '0' or not left.startswith('0')) and not right.endswith('0'):
                out.append(left + ('.' if right else '') + right)
        return out
    res = []
    for i in range(1, len(s)):
        for a in make(s[:i]):
            for b in make(s[i:]):
                res.append(f"({a}, {b})")
    return res`.split('\n').map((text, index) => ({ line: index + 1, text }))
