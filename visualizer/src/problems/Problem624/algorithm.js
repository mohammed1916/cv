export function parseInput(text) {
  const arrays = JSON.parse(text)
  if (!Array.isArray(arrays) || arrays.length < 2 || arrays.length > 1000) throw new Error('Enter a JSON array of 2–1,000 arrays.')
  if (arrays.some(a => !Array.isArray(a) || a.length < 1 || a.length > 500 || a.some(v => !Number.isInteger(v) || Math.abs(v) > 10000))) throw new Error('Each array needs 1–500 integers with |v| ≤ 10,000.')
  return arrays
}

// Pick one value from an earlier array and one from the current array; keep the best pair.
export function buildTrace(arrays) {
  let lo = Math.min(...arrays[0]), hi = Math.max(...arrays[0])
  let best = -Infinity
  const frames = [{ phase: 'start', array: 0, lo, hi, best: null, pair: null, activeLine: 2, message: `Track the smallest (${lo}) and largest (${hi}) from array 0.` }]
  for (let i = 1; i < arrays.length; i++) {
    const a = arrays[i]
    const amin = Math.min(...a), amax = Math.max(...a)
    const candidates = [Math.abs(amax - lo), Math.abs(hi - amin)]
    const value = Math.max(...candidates)
    const pair = candidates[0] >= candidates[1] ? [lo, amax] : [hi, amin]
    if (value > best) best = value
    frames.push({ phase: 'compare', array: i, lo, hi, amin, amax, best, pair, candidate: value, activeLine: 5, message: `Array ${i}: best distance against earlier values is ${value}.` })
    lo = Math.min(lo, amin); hi = Math.max(hi, amax)
    frames.push({ phase: 'update', array: i, lo, hi, amin, amax, best, pair: null, activeLine: 7, message: `Update the earlier range to [${lo}, ${hi}].` })
  }
  frames.push({ phase: 'done', array: arrays.length - 1, lo, hi, best, result: best, pair: null, activeLine: 8, message: `Maximum distance: ${best}.` })
  return { input: arrays, result: best, frames }
}

export const code = `def maxDistance(arrays):
    lo, hi = min(arrays[0]), max(arrays[0])
    best = 0
    for a in arrays[1:]:
        best = max(best, abs(max(a) - lo), abs(hi - min(a)))
        lo, hi = min(lo, min(a)), max(hi, max(a))
    return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
