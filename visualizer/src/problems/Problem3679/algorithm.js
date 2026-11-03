const L = s => code.findIndex(c => c.text.includes(s)) + 1
const PY = s => python.split('\n').findIndex(line => line.includes(s)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with arrivals, w and m.')
  const { arrivals, w, m } = input
  if (!Array.isArray(arrivals) || arrivals.length < 1 || arrivals.length > 20 || !arrivals.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('arrivals has 1 to 20 item types from 1 to 100.')
  if (!Number.isInteger(w) || w < 1 || w > arrivals.length) throw new Error('w is an integer from 1 to the number of arrivals.')
  if (!Number.isInteger(m) || m < 1 || m > w) throw new Error('m is an integer from 1 to w.')
  return { arrivals, w, m }
}

export function buildTrace({ arrivals, w, m }) {
  const kept = []
  const frames = []
  let discards = 0
  arrivals.forEach((kind, day) => {
    const start = Math.max(0, day - w + 1)
    const count = kept.filter(j => j >= start && arrivals[j] === kind).length
    const keep = count + 1 <= m
    if (keep) kept.push(day)
    else discards += 1
    frames.push({ pythonLine: PY('if count + 1'), phase: 'scan', activeLine: L('if keeping'), at: day, start, kept: [...kept], keep, count, discards,
      message: keep ? `Keep type ${kind} on day ${day + 1}; ${count} kept in the window before it.` : `Discard type ${kind} on day ${day + 1}: keeping it would exceed ${m} in the window.` })
  })
  frames.push({ pythonLine: PY('return discards'), phase: 'done', activeLine: L('return discards'), at: -1, start: 0, kept: [...kept], keep: null, count: 0, discards,
    message: `Discarded ${discards} arrival${discards === 1 ? '' : 's'}.` })
  return { input: { arrivals, w, m }, result: discards, frames }
}

export const code = [
  'minimum number of discarded arrivals',
  '  kept = empty list of kept days',
  '  for each day in order',
  '    count kept days in the last w days with the same type',
  '    if keeping it keeps that count at most m, keep it',
  '    otherwise discard it and add one',
  '  return the discard count',
].map((text, index) => ({ line: index + 1, text }))

export const python = `def min_discards(arrivals, w, m):
    kept = []
    discards = 0
    for day, kind in enumerate(arrivals):
        start = day - w + 1
        count = sum(1 for j in kept if j >= start and arrivals[j] == kind)
        if count + 1 <= m:
            kept.append(day)
        else:
            discards += 1
    return discards
`
