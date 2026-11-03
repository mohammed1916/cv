export const phases = [
  { id: 'start', label: 'Empty window', description: 'Start with no letters counted and no substring seen yet.' },
  { id: 'grow', label: 'Add letter', description: 'Extend the window on the right by one letter and count that letter.' },
  { id: 'shrink', label: 'Drop letter', description: 'Once the window holds minSize letters, drop the letter that left it so the length stays fixed.' },
  { id: 'skip', label: 'Not eligible', description: 'This window is too short or has too many distinct letters, so it cannot be counted.' },
  { id: 'count', label: 'Count substring', description: 'Record one more occurrence of this window text and update the best count.' },
  { id: 'done', label: 'Complete', description: 'Every window of the fixed length was examined; the best count is the answer.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"s": "aabbaa", "maxLetters": 2, "minSize": 2, "maxSize": 3}.')
  const { s, maxLetters, minSize, maxSize } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 40 || !/^[a-z]+$/.test(s)) throw new Error('s is 1 to 40 lowercase letters.')
  if (!Number.isInteger(maxLetters) || maxLetters < 1 || maxLetters > 26) throw new Error('maxLetters is an integer from 1 to 26.')
  if (!Number.isInteger(minSize) || minSize < 1 || minSize > 10) throw new Error('minSize is an integer from 1 to 10.')
  if (!Number.isInteger(maxSize) || maxSize < minSize || maxSize > 12) throw new Error('maxSize is an integer from minSize to 12.')
  return { s, maxLetters, minSize, maxSize }
}

export function buildTrace({ s, maxLetters, minSize }) {
  const frames = []
  const letters = new Map()
  const counts = new Map()
  let best = 0
  const distinct = () => [...letters.entries()].filter(([, c]) => c > 0).length
  const snap = (end, sub, extra = {}) => ({
    window: [...letters].filter(([, c]) => c > 0).map(([ch, c]) => [ch, c]),
    end, sub, distinct: distinct(), maxLetters, minSize, best,
    counts: [...counts].map(([text, c]) => [text, c]), ...extra,
  })
  const frame = (phase, line, message, snapshot, pyLine = line) => frames.push({ phase, activeLine: L(line), pythonLine: P(pyLine), snapshot, message })

  frame('start', 'counts = {}', `Fixed length ${minSize}: only the shortest allowed length needs checking, because a longer valid substring contains a valid shortest one.`, snap(-1, null))
  for (let end = 0; end < s.length; end++) {
    const ch = s[end]
    letters.set(ch, (letters.get(ch) ?? 0) + 1)
    frame('grow', 'add s[end]', `Add "${ch}" on the right. The window now holds ${end + 1 < minSize ? end + 1 : minSize} of ${minSize} letters.`, snap(end, null), 'letter_freq[s[end]] += 1')
    if (end >= minSize) {
      const out = s[end - minSize]
      letters.set(out, letters.get(out) - 1)
      frame('shrink', 'remove s[end - min_size]', `Drop "${out}" from the left so the window keeps length ${minSize}.`, snap(end, null), 'letter_freq[s[end - min_size]]')
    }
    if (end < minSize - 1) {
      frame('skip', 'if end < min_size - 1', `Only ${end + 1} letter(s) so far; a window of length ${minSize} is not complete yet.`, snap(end, null))
      continue
    }
    const sub = s.slice(end - minSize + 1, end + 1)
    if (distinct() > maxLetters) {
      frame('skip', 'if len(letter_freq) > max_letters', `"${sub}" has ${distinct()} distinct letters, more than ${maxLetters}, so it is not eligible.`, snap(end, sub), 'if len([c for c in letter_freq')
      continue
    }
    counts.set(sub, (counts.get(sub) ?? 0) + 1)
    best = Math.max(best, counts.get(sub))
    frame('count', 'counts[sub] += 1', `"${sub}" is eligible and has now occurred ${counts.get(sub)} time(s). Best so far: ${best}.`, snap(end, sub), 'counts[sub] = counts.get')
  }
  frame('done', 'return best', `The most frequent eligible substring occurs ${best} time(s).`, snap(s.length, null), 'return best')
  return { input: { s, maxLetters, minSize }, result: best, frames }
}

export const code = `max occurrences (s, max_letters, min_size):
  counts = {}; best = 0
  letter_freq = {}
  for end in range(len(s)):
    add s[end] to letter_freq
    if end >= min_size: remove s[end - min_size]
    if end < min_size - 1: continue
    if len(letter_freq) > max_letters: continue
    sub = s[end - min_size + 1 .. end]
    counts[sub] += 1; best = max(best, counts[sub])
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def max_occurrences(s, max_letters, min_size):
    counts = {}
    best = 0
    letter_freq = Counter()
    for end in range(len(s)):
        letter_freq[s[end]] += 1
        if end >= min_size:
            letter_freq[s[end - min_size]] -= 1
        if end < min_size - 1:
            continue
        if len([c for c in letter_freq if letter_freq[c] > 0]) > max_letters:
            continue
        sub = s[end - min_size + 1:end + 1]
        counts[sub] = counts.get(sub, 0) + 1
        best = max(best, counts[sub])
    return best`

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
