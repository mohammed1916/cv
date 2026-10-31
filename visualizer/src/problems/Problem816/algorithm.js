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
  push('start', L('drop the outer'), `Drop the parentheses: digits "${s}". Choose where the comma goes, then optionally a decimal point inside each number.`, { pythonLine: 2 })
  for (let i = 1; i < s.length; i++) {
    const a = s.slice(0, i), b = s.slice(i)
    push('split', L('for each comma position'), `Comma after ${i} digit${i > 1 ? 's' : ''}: left digits "${a}", right digits "${b}".`, { split: i, pythonLine: 11 })
    const lo = makeNumbers(a), ro = makeNumbers(b)
    push('make', L('set L to make'), `Legal numbers for "${a}": ${lo.length ? lo.join(', ') : 'none'}. For "${b}": ${ro.length ? ro.join(', ') : 'none'}. (No leading zeros like 01; no trailing zeros after the point like 1.0; a lone 0 is fine.)`, { split: i, leftOpts: lo, rightOpts: ro, pythonLine: 12 })
    for (const x of lo) for (const y of ro) res.push(`(${x}, ${y})`)
    push('combine', L('for each x in L'), lo.length && ro.length ? `Pair every left with every right: ${lo.length} x ${ro.length} = ${lo.length * ro.length} coordinates. Total so far: ${res.length}.` : `One side has no legal number, so this split yields nothing. Total so far: ${res.length}.`, { split: i, leftOpts: lo, rightOpts: ro, pythonLine: lo.length && ro.length ? 14 : 12 })
  }
  push('done', L('return res'), `${res.length} possible original coordinates.`, { pythonLine: 15 })
  return { input, result: res, frames }
}
export const code = `drop the outer parentheses from s to get the digits
set res to an empty list
define make(t) to list the legal numbers that the digits t can form
  set out to an empty list
  for each place d from 1 to the length of t
    set left to the first d digits and right to the rest
    if left is "0" or does not start with 0, and right does not end with 0, add left, a decimal point if right is not empty, and right to out
  return out
for each comma position i from 1 to the number of digits minus 1
  set L to make(the first i digits) and R to make(the rest of the digits)
  for each x in L and each y in R, append "(x, y)" to res
return res`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def ambiguous_coordinates(s):
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
    return res
`
