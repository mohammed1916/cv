export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Array.isArray(data.occupiedIntervals) || !Number.isInteger(data.freeStart) || !Number.isInteger(data.freeEnd)) {
    throw new Error('Use {"occupiedIntervals": [[s, e], ...], "freeStart": a, "freeEnd": b}.')
  }
  const { occupiedIntervals, freeStart, freeEnd } = data
  if (occupiedIntervals.length < 1 || occupiedIntervals.length > 8) throw new Error('Use 1 to 8 occupied intervals for the visualization.')
  for (const iv of occupiedIntervals) {
    if (!Array.isArray(iv) || iv.length !== 2) throw new Error('Each occupied interval is [start, end].')
    const [s, e] = iv
    if (!Number.isInteger(s) || !Number.isInteger(e) || s < 1 || e < s || e > 16) throw new Error('Intervals need 1 <= start <= end <= 16.')
  }
  if (freeStart < 1 || freeEnd < freeStart || freeEnd > 16) throw new Error('Need 1 <= freeStart <= freeEnd <= 16.')
  return { occupiedIntervals, freeStart, freeEnd }
}

export function buildTrace(input) {
  const { occupiedIntervals, freeStart, freeEnd } = input
  const sorted = occupiedIntervals.map(iv => [...iv]).sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const merged = []
  const frames = [{ phase: 'start', activeLine: L('let sorted be'), block: null, merged: [], answer: [], message: `Free window is [${freeStart}, ${freeEnd}].` }]
  for (const [s, e] of sorted) {
    if (merged.length && s <= merged[merged.length - 1][1] + 1) {
      merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], e)
    } else {
      merged.push([s, e])
    }
    frames.push({ phase: 'merge', activeLine: L('extend the last merged end'), block: [s, e], merged: merged.map(b => [...b]), answer: [], message: `Interval [${s}, ${e}] joins the merged list.` })
  }
  const answer = []
  for (const [s, e] of merged) {
    if (s < freeStart) answer.push([s, Math.min(e, freeStart - 1)])
    if (e > freeEnd) answer.push([Math.max(s, freeEnd + 1), e])
    frames.push({ phase: 'trim', activeLine: L('if s is before freeStart'), block: [s, e], merged: merged.map(b => [...b]), answer: answer.map(a => [...a]), message: `Block [${s}, ${e}] keeps its parts outside [${freeStart}, ${freeEnd}].` })
  }
  frames.push({ phase: 'done', activeLine: L('return answer'), block: null, merged: merged.map(b => [...b]), answer: answer.map(a => [...a]), message: `Remaining occupied intervals: ${answer.length}.` })
  return { input, result: answer, frames }
}

export const code = `remove the free window from the merged occupied intervals
  let sorted be the occupied intervals sorted by start
  let merged be an empty list
  for each interval [s, e] in sorted
    if merged is not empty and s is at most the last end plus 1 then
      extend the last merged end to the larger end
    else
      append [s, e] to merged
  let answer be an empty list
  for each merged interval [s, e]
    if s is before freeStart then append [s, min of e and freeStart minus 1]
    if e is after freeEnd then append [max of s and freeEnd plus 1, e]
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def filter_occupied_intervals(occupiedIntervals, freeStart, freeEnd):
    merged = []
    for s, e in sorted(occupiedIntervals):
        if merged and s <= merged[-1][1] + 1:
            merged[-1][1] = max(merged[-1][1], e)
        else:
            merged.append([s, e])
    answer = []
    for s, e in merged:
        if s < freeStart:
            answer.append([s, min(e, freeStart - 1)])
        if e > freeEnd:
            answer.append([max(s, freeEnd + 1), e])
    return answer
`
