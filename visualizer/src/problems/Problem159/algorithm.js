export const phases = [
  { id: 'start', label: 'Input', description: 'Read the string with an empty window.' },
  { id: 'expand', label: 'Extend right', description: 'Add the character at the right edge to the window counts.' },
  { id: 'shrink', label: 'Shrink left', description: 'While more than two distinct characters remain, drop the leftmost character.' },
  { id: 'record', label: 'Record best', description: 'Keep the longest valid window seen so far.' },
  { id: 'done', label: 'Return', description: 'Return the longest length found.' },
]

export const complexity = 'O(n) time: each index enters and leaves the window at most once. O(1) extra space because the window holds at most three distinct keys.'

export const examples = [
  { label: 'Mixed', input: 'xyzzyx' },
  { label: 'Runs', input: 'pppqqqrrrr' },
  { label: 'Single', input: 'm' },
]

export function parseInput(text) {
  const s = String(text).replace(/\r?\n$/, '')
  if (!/^[a-z]{1,200}$/.test(s)) throw new Error('Enter 1 to 200 lowercase letters.')
  return s
}

export function buildTrace(s) {
  const counts = new Map()
  const frames = []
  let left = 0
  let best = 0
  let bestStart = 0
  const snap = right => ({
    window: s.slice(left, right + 1),
    left,
    right,
    counts: Object.fromEntries([...counts].sort()),
    best,
  })
  frames.push({ phase: 'start', activeLine: 2, message: `Read "${s}" with an empty window.`, snapshot: snap(-1) })
  for (let right = 0; right < s.length; right++) {
    const ch = s[right]
    counts.set(ch, (counts.get(ch) || 0) + 1)
    frames.push({ phase: 'expand', activeLine: 4, message: `Add "${ch}" at index ${right}. Distinct characters: ${counts.size}.`, snapshot: snap(right) })
    while (counts.size > 2) {
      const out = s[left]
      counts.set(out, counts.get(out) - 1)
      if (counts.get(out) === 0) counts.delete(out)
      left++
      frames.push({ phase: 'shrink', activeLine: 6, message: `Remove "${out}" from the left. Distinct characters now ${counts.size}.`, snapshot: snap(right) })
    }
    const length = right - left + 1
    if (length > best) {
      best = length
      bestStart = left
    }
    frames.push({ phase: 'record', activeLine: 7, message: `Window length ${length}. Best is ${best}.`, snapshot: snap(right) })
  }
  frames.push({ phase: 'done', activeLine: 8, message: `Return ${best}.`, snapshot: snap(s.length - 1) })
  return { input: s, result: best, window: s.slice(bestStart, bestStart + best), frames }
}

export const python = `def longestTwoDistinct(s):
    counts, left, best = {}, 0, 0
    for right, ch in enumerate(s):
        counts[ch] = counts.get(ch, 0) + 1
        while len(counts) > 2:
            out = s[left]
            counts[out] -= 1
            if counts[out] == 0:
                del counts[out]
            left += 1
        best = max(best, right - left + 1)
    return best`

export const code = [
  'FUNCTION longestTwoDistinct(s)',
  '    counts = empty map; left = 0; best = 0',
  '    FOR right from 0 to length(s) - 1, ch = s[right]',
  '        counts[ch] += 1',
  '        WHILE number of distinct keys > 2',
  '            remove s[left] from counts; left += 1',
  '        best = max(best, right - left + 1)',
  '    RETURN best',
].map((text, index) => ({ line: index + 1, text }))

// Pseudocode line -> Python line.
export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 11, 8: 12 }
