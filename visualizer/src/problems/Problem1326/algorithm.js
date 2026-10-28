export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use a JSON object with n and ranges.')
  const { n, ranges } = data
  if (!Number.isInteger(n) || n < 1 || n > 20) throw new Error('n is an integer from 1 to 20.')
  if (!Array.isArray(ranges) || ranges.length !== n + 1) throw new Error('ranges must have n plus 1 entries.')
  if (ranges.some(v => !Number.isInteger(v) || v < 0 || v > 10)) throw new Error('Range values are integers from 0 to 10.')
  return { n, ranges }
}

export function buildTrace(input) {
  const { n, ranges } = input
  const spans = ranges
    .map((r, i) => ({ i, left: Math.max(0, i - r), right: Math.min(n, i + r) }))
    .sort((p, q) => p.left - q.left || q.right - p.right)
  let covered = 0
  let farthest = 0
  let taps = 0
  let k = 0
  const frames = [{ phase: 'start', activeLine: L('set covered to zero'), covered, taps, farthest, message: 'Nothing is watered yet. The garden runs from 0 to n.' }]
  while (covered < n) {
    while (k < spans.length && spans[k].left <= covered) {
      farthest = Math.max(farthest, spans[k].right)
      k += 1
    }
    if (farthest <= covered) {
      frames.push({ phase: 'stuck', activeLine: L('return minus one'), covered, taps, farthest, message: `No tap reaches past ${covered}, so the garden cannot be watered.` })
      return { input, result: -1, frames }
    }
    taps += 1
    covered = farthest
    frames.push({ phase: 'open', activeLine: L('open one more tap'), covered, taps, farthest, message: `Open another tap; the watered range now reaches ${covered}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return taps'), covered, taps, farthest, message: `Fewest taps: ${taps}.` })
  return { input, result: taps, frames }
}

export const code = `fewest taps that water the garden from zero to n:
  for each tap make its watered span, clipped to the garden
  sort the spans by where they start
  set covered to zero, farthest to zero and taps to zero
  while covered is less than n
    among spans starting at or before covered, keep the farthest right end
    if farthest is not beyond covered then return minus one
    open one more tap by adding one to taps and setting covered to farthest
  return taps`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_taps(n, ranges):
    spans = sorted((max(0, i - r), min(n, i + r)) for i, r in enumerate(ranges))
    covered = 0
    farthest = 0
    taps = 0
    k = 0
    while covered < n:
        while k < len(spans) and spans[k][0] <= covered:
            farthest = max(farthest, spans[k][1])
            k += 1
        if farthest <= covered:
            return -1
        taps += 1
        covered = farthest
    return taps
`
