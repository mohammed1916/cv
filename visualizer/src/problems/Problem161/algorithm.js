export const phases = [
  { id: 'start', label: 'Start', description: 'Read both strings and compare their lengths.' },
  { id: 'length', label: 'Length check', description: 'Lengths differ by more than one, so no single edit can match them. Otherwise, put the shorter string first.' },
  { id: 'scan', label: 'Scan prefix', description: 'Advance while both strings agree at this index.' },
  { id: 'mismatch', label: 'First difference', description: 'The first mismatch is where the one edit must happen.' },
  { id: 'tail', label: 'Compare tails', description: 'After the one edit, the remaining characters must match exactly.' },
  { id: 'done', label: 'Complete', description: 'Return whether exactly one edit turns one string into the other.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"s": "cart", "t": "cat"}.')
  const { s, t } = input
  if (typeof s !== 'string' || typeof t !== 'string' || s.length > 30 || t.length > 30) throw new Error('s and t are strings of at most 30 characters.')
  if (!/^[a-z]*$/.test(s) || !/^[a-z]*$/.test(t)) throw new Error('Use lowercase letters only.')
  return { s, t }
}

export const code = `one edit apart (s, t):
  if abs(len(s) - len(t)) > 1:
    return false
  if len(s) > len(t): swap s and t
  i = 0
  while i < len(s) and s[i] == t[i]:
    i += 1
  if i == len(s):
    return len(t) == len(s) + 1
  if len(s) == len(t):
    return s[i+1:] == t[i+1:]
  return s[i:] == t[i+1:]`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def one_edit_apart(s, t):
    if abs(len(s) - len(t)) > 1:
        return False
    if len(s) > len(t):
        s, t = t, s
    i = 0
    while i < len(s) and s[i] == t[i]:
        i += 1
    if i == len(s):
        return len(t) == len(s) + 1
    if len(s) == len(t):
        return s[i + 1:] == t[i + 1:]
    return s[i:] == t[i + 1:]
`

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
const at = (phase, pseudo, py, message, snapshot) => ({ phase, activeLine: L(pseudo), pythonLine: P(py), message, snapshot })

export function buildTrace({ s: original, t: other }) {
  let s = original
  let t = other
  const snap = (i) => ({ s, t, i })
  const frames = [at('start', 'one edit apart', 'def one_edit', `s has length ${s.length} and t has length ${t.length}.`, snap(null))]
  if (Math.abs(s.length - t.length) > 1) {
    frames.push(at('length', 'abs(len(s)', 'abs(len(s)', `The lengths differ by ${Math.abs(s.length - t.length)}, which one edit cannot bridge.`, snap(null)))
    frames.push(at('done', 'return false', 'return False', 'Answer: false.', snap(null)))
    return { input: { s: original, t: other }, result: false, frames }
  }
  frames.push(at('length', 'abs(len(s)', 'abs(len(s)', `The lengths differ by ${Math.abs(s.length - t.length)}, so a single edit may work.`, snap(null)))
  if (s.length > t.length) {
    ;[s, t] = [t, s]
    frames.push(at('length', 'swap s and t', 's, t = t, s', `Swap so s is the shorter or equal-length string: s = "${s}", t = "${t}".`, snap(null)))
  }
  let i = 0
  while (i < s.length && s[i] === t[i]) {
    i++
    frames.push(at('scan', 'i += 1', 'i += 1', `Index ${i - 1} matches ("${s[i - 1]}"), so keep scanning.`, snap(i)))
  }
  if (i === s.length) {
    const result = t.length === s.length + 1
    frames.push(at('tail', 'return len(t)', 'return len(t)', `s is a prefix of t. One extra character in t is needed: ${result ? 'it has exactly one.' : 'the length gap is not exactly one.'}`, snap(i)))
    frames.push(at('done', 'return len(t)', 'return len(t)', `Answer: ${result}.`, snap(i)))
    return { input: { s: original, t: other }, result, frames }
  }
  frames.push(at('mismatch', 'while i < len(s)', 'while i < len(s)', `Index ${i} differs: "${s[i]}" against "${t[i]}". The one edit must happen here.`, snap(i)))
  let result
  if (s.length === t.length) {
    result = s.slice(i + 1) === t.slice(i + 1)
    frames.push(at('tail', 'return s[i+1:]', 'return s[i + 1:]', `Replace at index ${i}. The tails "${s.slice(i + 1)}" and "${t.slice(i + 1)}" ${result ? 'match.' : 'do not match.'}`, snap(i)))
  } else {
    result = s.slice(i) === t.slice(i + 1)
    frames.push(at('tail', 'return s[i:]', 'return s[i:]', `Insert into t at index ${i}. Then "${s.slice(i)}" must equal "${t.slice(i + 1)}": ${result ? 'it does.' : 'it does not.'}`, snap(i)))
  }
  frames.push(at('done', 'return s[i:]', 'return s[i:]', `Answer: ${result}.`, snap(i)))
  return { input: { s: original, t: other }, result, frames }
}
