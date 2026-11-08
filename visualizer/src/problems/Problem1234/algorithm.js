// Independently written teaching model. The sample strings are invented for this visualizer.
const LETTERS = ['Q', 'W', 'E', 'R']

export const phases = [
  { id: 'start', label: 'Count', description: 'Count every letter and set the target quarter length.' },
  { id: 'inspect', label: 'Window', description: 'Move the window edges and test the letters outside it.' },
  { id: 'update', label: 'Record', description: 'A valid window is a candidate replacement; keep the shortest.' },
  { id: 'done', label: 'Result', description: 'Report the shortest replacement length.' },
]

export const inputLabel = 'Letters Q, W, E and R (length a multiple of 4, up to 24)'
export const complexity = 'O(n) time with a four-letter alphabet and O(1) extra counters. The visualizer caps the string at 24 letters.'
export const examples = [
  { label: 'Balanced', input: 'QWERRWEQ' },
  { label: 'Heavy Q', input: 'QQQQWWEE' },
  { label: 'All Q', input: 'QQQQQQQQ' },
  { label: 'Shortest valid string', input: 'QWER' },
  { label: 'Only one letter repeated', input: 'QQQQWWWW' },
  { label: 'Largest allowed length, one letter', input: 'QQQQQQQQQQQQQQQQQQQQQQQQ' },
  { label: 'Long run: 24 letters', input: 'EQEWRWQQWWERQWREEQRRWQWE' },
]

export const code = `function balancedReplacement(s) {
  const k = s.length / 4
  const outside = { Q: 0, W: 0, E: 0, R: 0 }
  for (const c of s) outside[c] += 1
  if (Object.values(outside).every(c => c <= k)) return 0
  let best = s.length
  let left = 0
  for (let right = 0; right < s.length; right++) {
    outside[s[right]] -= 1
    while (Object.values(outside).every(c => c <= k)) {
      best = Math.min(best, right - left + 1)
      outside[s[left]] += 1
      left += 1
    }
  }
  return best
}`

export const python = `from collections import Counter

def balanced_replacement(s):
    k = len(s) // 4
    outside = Counter(s)
    if all(outside[c] <= k for c in "QWER"):
        return 0
    best, left = len(s), 0
    for right in range(len(s)):
        outside[s[right]] -= 1
        while all(outside[c] <= k for c in "QWER"):
            best = min(best, right - left + 1)
            outside[s[left]] += 1
            left += 1
    return best`

const at = (source, key) => {
  const index = source.split('\n').findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing solution line: ${key}`)
  return index + 1
}
const CODE_LINE = key => at(code, key)
const PY_LINE = key => at(python, key)

export function parseInput(text) {
  const s = text.trim()
  if (!/^[QWER]+$/.test(s)) throw new Error('Use only the letters Q, W, E and R.')
  if (s.length < 4 || s.length > 24 || s.length % 4 !== 0) throw new Error('The length must be a multiple of 4 from 4 to 24.')
  return s
}

function tally(s) {
  const counts = Object.fromEntries(LETTERS.map(c => [c, 0]))
  for (const ch of s) counts[ch] += 1
  return counts
}

export function buildTrace(s) {
  const n = s.length
  const k = n / 4
  const outside = tally(s)
  const frames = []
  let best = n
  let left = 0
  const fits = () => LETTERS.every(c => outside[c] <= k)
  const push = (phase, key, pyKey, message, window = null, extra = {}) => frames.push({
    phase, activeLine: CODE_LINE(key), pythonLine: PY_LINE(pyKey), message,
    text: s, k, window, outside: { ...outside }, best: extra.best ?? null, valid: fits(), result: extra.result ?? null,
  })

  push('start', 'const outside = {', 'Counter(s)', `Length ${n} gives a target of ${k} for each letter. Counts: ${LETTERS.map(c => `${c} ${outside[c]}`).join(', ')}.`)
  if (fits()) {
    frames.push({ phase: 'done', activeLine: CODE_LINE('return 0'), pythonLine: PY_LINE('return 0'), message: 'Every letter already has at most the target count, so no replacement is needed.', text: s, k, window: null, outside: { ...outside }, best: 0, valid: true, result: 0 })
    return { input: s, result: 0, frames }
  }

  for (let right = 0; right < n; right++) {
    outside[s[right]] -= 1
    push('inspect', 'outside[s[right]] -= 1', 'outside[s[right]] -= 1',
      `Position ${right} (${s[right]}) moves inside the window, so it leaves the outside counts. ${fits() ? 'Every outside count is within the target.' : 'Some letter still has too many outside, so the window must grow.'}`,
      [left, right], { best })
    while (fits()) {
      const length = right - left + 1
      best = Math.min(best, length)
      push('update', 'best = Math.min', 'best = min', `Window ${left}–${right} (length ${length}) is valid: its replacement can supply every excess letter. Best so far is ${best}.`, [left, right], { best })
      outside[s[left]] += 1
      left += 1
      push('inspect', 'left += 1', 'left += 1', `Position ${left - 1} (${s[left - 1]}) returns to the outside counts. ${fits() ? 'The window is still valid, so it can shrink further.' : 'The window is no longer valid, so the right edge moves next.'}`, left <= right ? [left, right] : null, { best })
    }
  }

  frames.push({ phase: 'done', activeLine: CODE_LINE('return best'), pythonLine: PY_LINE('return best'), message: `The shortest valid replacement has length ${best}.`, text: s, k, window: null, outside: { ...outside }, best, valid: true, result: best })
  return { input: s, result: best, frames }
}
