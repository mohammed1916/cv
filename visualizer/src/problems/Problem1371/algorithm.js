export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with the empty prefix, whose parity mask is zero.' },
  { id: 'inspect', label: 'Prefix', description: 'Each vowel toggles one bit of the parity mask as the prefix grows.' },
  { id: 'update', label: 'Match', description: 'A mask seen before means the substring between the two prefixes has even vowel counts.' },
  { id: 'done', label: 'Complete', description: 'The longest matching gap is the answer.' },
]

export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || typeof value.s !== 'string' || !/^[a-z]{1,200}$/.test(value.s)) {
    throw new Error('Enter JSON like {"s":"eleetminicoder"} with 1–200 lowercase letters.')
  }
  return { s: value.s }
}

const VOWELS = 'aeiou'
const CODE = [
  'function longestEvenVowels(s) {',
  '  const first = new Map([[0, 0]])',
  '  let mask = 0',
  '  let best = 0',
  '  for (let i = 1; i <= s.length; i++) {',
  '    const bit = "aeiou".indexOf(s[i - 1])',
  '    if (bit >= 0) mask ^= 1 << bit',
  '    if (first.has(mask)) best = Math.max(best, i - first.get(mask))',
  '    else first.set(mask, i)',
  '  }',
  '  return best',
  '}',
]
const PY_LINES = ['def longest_even_vowels(s):', '    first = {0: 0}', '    mask = 0', '    best = 0', '    for i, ch in enumerate(s, start=1):', "        if ch in 'aeiou':", "            mask ^= 1 << 'aeiou'.index(ch)", '        if mask in first:', '            best = max(best, i - first[mask])', '        else:', '            first[mask] = i', '    return best']
const LINE = { start: 2, toggle: 7, match: 8, store: 9, done: 11 }
const PY = { start: 2, toggle: 7, match: 9, store: 11, done: 12 }

export function buildTrace(input) {
  const { s } = input
  const first = new Map([[0, 0]]) // parity mask -> earliest prefix length that produced it
  const frames = []
  let mask = 0
  let best = 0
  let bestRange = null
  const maskText = m => [...VOWELS].map((v, bit) => `${v}:${(m >> bit) & 1}`).join(' ')

  frames.push({
    phase: 'start', activeLine: LINE.start, pythonLine: PY.start,
    message: 'The empty prefix has parity mask 00000 and is recorded at length 0.',
    snapshot: { mask, maskText: maskText(mask), prefix: 0, best, bestRange: null, seen: 1 },
  })

  for (let i = 1; i <= s.length; i++) {
    const ch = s[i - 1]
    const bit = VOWELS.indexOf(ch)
    if (bit >= 0) mask ^= 1 << bit
    frames.push({
      phase: 'inspect', activeLine: LINE.toggle, pythonLine: PY.toggle,
      message: bit >= 0
        ? `Prefix ${i} adds vowel ${ch}, flipping its parity bit. Mask is now ${maskText(mask)}.`
        : `Prefix ${i} adds consonant ${ch}. The parity mask stays ${maskText(mask)}.`,
      snapshot: { mask, maskText: maskText(mask), prefix: i, best, bestRange, seen: first.size, changed: bit >= 0 ? ch : null },
    })
    if (first.has(mask)) {
      const start = first.get(mask)
      const length = i - start
      if (length > best) { best = length; bestRange = [start, i] }
      frames.push({
        phase: 'update', activeLine: LINE.match, pythonLine: PY.match,
        message: `This mask was seen at prefix ${start}, so the substring s[${start}..${i - 1}] (length ${length}) has every vowel an even number of times.${length === best ? ' It is the longest so far.' : ''}`,
        snapshot: { mask, maskText: maskText(mask), prefix: i, best, bestRange, seen: first.size, match: start, window: [start, i] },
      })
    } else {
      first.set(mask, i)
      frames.push({
        phase: 'update', activeLine: LINE.store, pythonLine: PY.store,
        message: `Mask ${maskText(mask)} is new. Remember prefix ${i} for it, because a later match gives the longest gap.`,
        snapshot: { mask, maskText: maskText(mask), prefix: i, best, bestRange, seen: first.size, match: null },
      })
    }
  }

  frames.push({
    phase: 'done', activeLine: LINE.done, pythonLine: PY.done,
    message: best === 0 ? 'No substring has every vowel an even number of times, so the answer is 0.' : `The longest substring with all vowel counts even has length ${best}.`,
    snapshot: { mask, maskText: maskText(mask), prefix: s.length, best, bestRange, seen: first.size },
  })
  return { input, result: best, frames }
}

export const code = CODE.map((text, index) => ({ line: index + 1, text }))

export const python = PY_LINES.join('\n')
