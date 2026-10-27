export function parseInput(text) {
  const pairs = JSON.parse(text)
  if (!Array.isArray(pairs) || pairs.length < 1 || pairs.length > 1000) throw new Error('Enter a JSON array of 1–1,000 pairs [left, right].')
  if (pairs.some(p => !Array.isArray(p) || p.length !== 2 || !Number.isInteger(p[0]) || !Number.isInteger(p[1]) || Math.abs(p[0]) > 1000 || Math.abs(p[1]) > 1000 || p[0] >= p[1])) throw new Error('Each pair needs integers with |v| ≤ 1000 and left < right.')
  return pairs
}

// Greedy: sort by right endpoint, then take every pair that starts after the last chosen end.
export function buildTrace(pairs) {
  const sorted = pairs.map((p, index) => ({ p, index })).sort((a, b) => a.p[1] - b.p[1] || a.index - b.index)
  let end = -Infinity, count = 0
  const chosen = []
  const frames = [{ phase: 'start', current: null, chain: [], end: null, activeLine: 2, message: 'Sort pairs by their right endpoint.' }]
  for (const { p } of sorted) {
    const fits = p[0] > end
    if (fits) { end = p[1]; count++; chosen.push(p) }
    frames.push({ phase: fits ? 'take' : 'skip', current: p, chain: chosen.map(x => [...x]), end: end === -Infinity ? null : end, count, activeLine: fits ? 5 : 7,
      message: fits ? `[${p[0]}, ${p[1]}] starts after ${end === p[1] ? 'the previous end' : 'the last end'}: take it. Chain ${count}.` : `[${p[0]}, ${p[1]}] starts at or before ${end}: skip it.` })
  }
  frames.push({ phase: 'done', current: null, chain: chosen.map(x => [...x]), end, count, result: count, activeLine: 9, message: `Longest chain: ${count} pairs.` })
  return { input: pairs, result: count, frames }
}

export const code = `sort pairs by their second value; set end to negative infinity and count to 0
for each pair [start, finish] in that order:
  if start is strictly greater than end:
    count the pair and set end to finish
  otherwise skip the pair because it touches or overlaps
return count`.split('\n').map((text, index) => ({ line: index + 1, text }))

// Sequence trace: activeLine 1 (setup), 4 (update per pair), 5 (return).
// Each update frame records a take or a skip; the take line is 4 and the skip line is 5.
export const LINE_MAP = { 1: 1, 5: 6 }

export function familyLine(frame) {
  if (frame.phase === 'update') return frame.message.startsWith('Take') ? 4 : 5
  return LINE_MAP[frame.activeLine] ?? frame.activeLine
}

export const python = `def find_longest_chain(pairs):
    end = float('-inf')
    count = 0
    for start, finish in sorted(pairs, key=lambda pair: pair[1]):
        if start > end:
            count += 1
            end = finish
    return count`
