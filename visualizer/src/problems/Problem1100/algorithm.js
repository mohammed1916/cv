// Own sliding-window walkthrough. The sample text is invented for this visualization.
const CODE_TEXT = `function countDistinctWindows(text, k) {
  const counts = new Map()
  let good = 0
  let left = 0
  for (let right = 0; right < text.length; right++) {
    const ch = text[right]
    counts.set(ch, (counts.get(ch) ?? 0) + 1)
    if (right - left + 1 > k) {
      const out = text[left]
      counts.set(out, counts.get(out) - 1)
      if (counts.get(out) === 0) counts.delete(out)
      left++
    }
    if (right - left + 1 === k && counts.size === k) good++
  }
  return good
}`

export const python = `def count_distinct_windows(text, k):
    counts = {}
    good = 0
    left = 0
    for right, ch in enumerate(text):
        counts[ch] = counts.get(ch, 0) + 1
        if right - left + 1 > k:
            out = text[left]
            counts[out] -= 1
            if counts[out] == 0:
                del counts[out]
            left += 1
        if right - left + 1 == k and len(counts) == k:
            good += 1
    return good`

const PY = python.split('\n')
export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))

const STEP = {
  start: ['const counts = new Map()', 'counts = {}'],
  grow: ['counts.set(ch', 'counts[ch] = counts.get'],
  shrink: ['counts.set(out', 'counts[out] -= 1'],
  check: ['if (right - left + 1 === k', 'if right - left + 1 == k'],
  record: ['good++', 'good += 1'],
  done: ['return good', 'return good'],
}
function lineOf(lines, key) {
  const index = lines.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing line: ${key}`)
  return index + 1
}
const frame = (phase, step, message, snapshot) => ({
  phase,
  activeLine: lineOf(CODE_TEXT.split('\n'), STEP[step][0]),
  pythonLine: lineOf(PY, STEP[step][1]),
  message,
  snapshot,
})

export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with an empty window and an empty count map.' },
  { id: 'grow', label: 'Extend', description: 'Add the character at the right edge of the window.' },
  { id: 'shrink', label: 'Shrink', description: 'Drop the left character when the window is wider than k.' },
  { id: 'check', label: 'Check', description: 'A size-k window qualifies when its map has k distinct keys.' },
  { id: 'record', label: 'Count', description: 'Add one to the number of qualifying windows.' },
  { id: 'done', label: 'Result', description: 'Return how many size-k windows qualify.' },
]

export const inputLabel = 'JSON with text and k, e.g. {"text":"abcdab","k":3}'
export const complexity = 'O(n) time because each index enters and leaves the window once. The visualizer accepts up to 16 characters.'
export const examples = [
  { label: 'Sample', input: '{"text":"abcdab","k":3}' },
  { label: 'Repeats', input: '{"text":"aabbcc","k":2}' },
  { label: 'Wide window', input: '{"text":"xyz","k":5}' },
  { label: 'Single letter', input: '{"text":"a","k":1}' },
  { label: 'Repeats only, none qualify', input: '{"text":"aaa","k":2}' },
  { label: 'Whole text as one window', input: '{"text":"abcdefghijklmnop","k":16}' },
  { label: 'Long run: 16 letters, k = 4', input: '{"text":"hheijeiachfgaaic","k":4}' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input.text !== 'string' || !Number.isInteger(input.k)) throw new Error('Use {"text":"...","k":n}.')
  if (!/^[a-z]{1,16}$/.test(input.text)) throw new Error('Use 1 to 16 lowercase letters.')
  if (input.k < 1 || input.k > 16) throw new Error('k must be an integer from 1 to 16.')
  return { text: input.text, k: input.k }
}

export function buildTrace(input) {
  const { text, k } = input
  const counts = new Map()
  let left = 0
  let good = 0
  const snap = extra => ({ text, k, left, right: extra.right ?? -1, counts: Object.fromEntries(counts), good, ...extra })
  const frames = [frame('start', 'start', `Empty window; we need size-${k} windows with ${k} distinct letters.`, snap({ right: -1 }))]
  for (let right = 0; right < text.length; right++) {
    const ch = text[right]
    counts.set(ch, (counts.get(ch) ?? 0) + 1)
    frames.push(frame('grow', 'grow', `Add "${ch}" at position ${right}.`, snap({ right })))
    if (right - left + 1 > k) {
      const out = text[left]
      counts.set(out, counts.get(out) - 1)
      if (counts.get(out) === 0) counts.delete(out)
      left += 1
      frames.push(frame('shrink', 'shrink', `The window is too wide; drop "${out}" from the left.`, snap({ right })))
    }
    const size = right - left + 1
    const qualifies = size === k && counts.size === k
    frames.push(frame('check', 'check', size === k ? `Window ${text.slice(left, right + 1)} has ${counts.size} distinct letters${qualifies ? '' : ' (repeats present)'}.` : `Window has size ${size}; it is not yet k = ${k}.`, snap({ right, qualifies })))
    if (qualifies) {
      good += 1
      frames.push(frame('record', 'record', `Count it: ${good} qualifying window${good === 1 ? '' : 's'} so far.`, snap({ right })))
    }
  }
  frames.push(frame('done', 'done', `Return ${good}.`, snap({ right: text.length - 1 })))
  return { input, result: good, frames }
}
