export function parseInput(text) {
  const data = JSON.parse(text)
  const { letters, target } = data ?? {}
  if (!Array.isArray(letters) || letters.length < 2 || letters.length > 40 || letters.some(c => typeof c !== 'string' || !/^[a-z]$/.test(c))) throw new Error('letters must be 2–40 single lowercase letters.')
  if (letters.some((c, i) => i > 0 && letters[i - 1] > c)) throw new Error('letters must be sorted in non-decreasing order.')
  if (typeof target !== 'string' || !/^[a-z]$/.test(target)) throw new Error('target must be one lowercase letter.')
  return { letters, target }
}

const JS_LINES = [
  'function nextGreatestLetter(letters, target) {',
  '  let lo = 0, hi = letters.length // the answer index lies in [lo, hi)',
  '  while (lo < hi) {',
  '    const mid = Math.floor((lo + hi) / 2) // the position being tested',
  '    if (letters[mid] <= target) lo = mid + 1 // mid is not greater: the answer is to the right',
  '    else hi = mid // mid is greater: keep it as a candidate',
  '  }',
  '  return letters[lo % letters.length] // wrap around past the last letter',
  '}',
]
const PY_LINES = [
  'def next_greatest_letter(letters, target):',
  '    lo, hi = 0, len(letters)',
  '    while lo < hi:',
  '        mid = (lo + hi) // 2',
  '        if letters[mid] <= target:',
  '            lo = mid + 1',
  '        else:',
  '            hi = mid',
  '    return letters[lo % len(letters)]',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// A binary search for the first letter greater than the target. The search interval [lo, hi) halves each step.
export function buildTrace({ letters, target }) {
  let lo = 0, hi = letters.length
  const frames = [{ phase: 'start', lo, hi, mid: null, activeLine: L('let lo = 0'), pythonLine: P('lo, hi = 0'), message: `Search the index range [${lo}, ${hi}) for the first letter greater than '${target}'.` }]
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    const greater = letters[mid] > target
    if (!greater) lo = mid + 1
    else hi = mid
    frames.push({ phase: greater ? 'keep' : 'right', lo, hi, mid, activeLine: L(greater ? 'else hi = mid' : 'if (letters[mid] <= target)'), pythonLine: P(greater ? 'hi = mid' : 'lo = mid + 1'),
      message: greater ? `letters[${mid}] = '${letters[mid]}' is greater than '${target}': the answer is at ${mid} or before, so hi becomes ${hi}.` : `letters[${mid}] = '${letters[mid]}' is not greater than '${target}': the answer is after ${mid}, so lo becomes ${lo}.` })
  }
  const result = letters[lo % letters.length]
  frames.push({ phase: 'done', lo, hi, mid: null, result, activeLine: L('return letters'), pythonLine: P('return letters'), message: `lo = ${lo}. ${lo === letters.length ? 'Past the end, so it wraps to the first letter.' : ''} Answer: '${result}'.` })
  return { input: { letters, target }, result, frames }
}
