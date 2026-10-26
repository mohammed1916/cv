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

export const code = `def findLongestChain(pairs):
    end, count = float('-inf'), 0
    for left, right in sorted(pairs, key=lambda p: p[1]):
        if left > end:
            end, count = right, count + 1
    return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
