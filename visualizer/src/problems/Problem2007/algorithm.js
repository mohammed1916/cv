export const phases = [
  { id: 'start', label: 'Parity check', description: 'A doubled array has even length; otherwise there is no answer.' },
  { id: 'smallest', label: 'Smallest unmatched', description: 'The smallest remaining value must be an original, because its double is the only partner that can pair with it.' },
  { id: 'match', label: 'Match its double', description: 'Remove the value and its double from the counts; the value joins the original array.' },
  { id: 'done', label: 'Result', description: 'Return the originals, or an empty array when some value has no double.' },
]

export const code = `function findOriginalArray(changed) {
  if (changed.length % 2 !== 0) return []
  const counts = new Map()
  for (const v of changed) counts.set(v, (counts.get(v) ?? 0) + 1)
  const original = []
  for (const v of [...changed].sort((a, b) => a - b)) {
    if (counts.get(v) === 0) continue
    counts.set(v, counts.get(v) - 1)
    if ((counts.get(2 * v) ?? 0) === 0) return []
    counts.set(2 * v, counts.get(2 * v) - 1)
    original.push(v)
  }
  return original
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def find_original_array(changed):
    if len(changed) % 2 != 0:
        return []
    counts = {}
    for v in changed:
        counts[v] = counts.get(v, 0) + 1
    original = []
    for v in sorted(changed):
        if counts.get(v, 0) == 0:
            continue
        counts[v] -= 1
        if counts.get(2 * v, 0) == 0:
            return []
        counts[2 * v] -= 1
        original.append(v)
    return original
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let changed
  try { changed = JSON.parse(text) } catch { throw new Error('Use a JSON array such as [1,3,4,2,6,8].') }
  if (!Array.isArray(changed) || changed.length < 1 || changed.length > 20) throw new Error('changed must have 1 to 20 values here.')
  if (!changed.every(v => Number.isInteger(v) && v >= 0 && v <= 100)) throw new Error('Each value must be a whole number from 0 to 100.')
  return changed
}

export function buildTrace(changed) {
  const frames = []
  const counts = new Map()
  for (const v of changed) counts.set(v, (counts.get(v) ?? 0) + 1)
  const original = []
  const add = (phase, c, p, message, value) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { changed, value, original: original.slice(), counts: [...counts.entries()].filter(([, c]) => c > 0).sort((a, b) => a[0] - b[0]) },
  })
  if (changed.length % 2 !== 0) {
    add('start', 'if (changed.length % 2', 'if len(changed) % 2', 'The length is odd, so the array cannot be doubled.', null)
    add('done', 'return []', 'return []', 'No original array exists.', null)
    return { input: changed, result: [], frames }
  }
  add('start', 'if (changed.length % 2', 'if len(changed) % 2', 'The length is even; try to match every value with its double.', null)
  let failed = false
  for (const v of [...changed].sort((a, b) => a - b)) {
    if (counts.get(v) === 0) continue
    add('smallest', 'for (const v of', 'for v in sorted', `Smallest unmatched value is ${v}.`, v)
    counts.set(v, counts.get(v) - 1)
    if ((counts.get(2 * v) ?? 0) === 0) { failed = true; add('match', 'return []', 'return []', `${2 * v} is missing, so ${v} has no double.`, v); break }
    counts.set(2 * v, counts.get(2 * v) - 1)
    original.push(v)
    add('match', 'original.push(v)', 'original.append(v)', `Pair ${v} with ${2 * v}; keep ${v} as an original.`, v)
  }
  const result = failed ? [] : original
  add('done', 'return original', 'return original', failed ? 'Some value has no double, so the answer is empty.' : `Original array: ${result.join(', ')}.`, null)
  return { input: changed, result, frames }
}
