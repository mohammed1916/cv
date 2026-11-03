export const code = [
  'find the maximum number of distinct points where the chart meets one horizontal line',
  '  let heights be the sorted distinct values of y',
  '  let candidates be each height and the midpoint of each neighbouring pair',
  '  set best to 0',
  '  for each candidate line height h',
  '    set hits to 0',
  '    for each point i',
  '      if y[i] equals h then add one to hits',
  '    for each segment from i to i plus 1',
  '      if h is strictly between y[i] and y[i + 1] then add one to hits',
  '    if hits is greater than best then set best to hits',
  '  return best',
].map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def max_chart_intersections(y):
    n = len(y)
    heights = sorted(set(y))
    candidates = []
    for k, h in enumerate(heights):
        candidates.append(h)
        if k + 1 < len(heights):
            candidates.append((h + heights[k + 1]) / 2)
    best = 0
    for h in candidates:
        hits = 0
        for i in range(n):
            if y[i] == h:
                hits += 1
        for i in range(n - 1):
            if min(y[i], y[i + 1]) < h < max(y[i], y[i + 1]):
                hits += 1
        best = max(best, hits)
    return best
`
const PY = python.split('\n')
const P = s => {
  const index = PY.findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export function parseInput(text) {
  const y = JSON.parse(text)
  if (!Array.isArray(y) || y.length < 2 || y.length > 12) throw new Error('Use an array of 2 to 12 integers.')
  if (!y.every(v => Number.isInteger(v) && v >= 0 && v <= 30)) throw new Error('Each y value is an integer from 0 to 30.')
  for (let i = 0; i + 1 < y.length; i++) {
    if (y[i] === y[i + 1]) throw new Error('Adjacent y values must differ.')
  }
  return y
}

export function buildTrace(y) {
  const n = y.length
  const heights = [...new Set(y)].sort((a, b) => a - b)
  const candidates = []
  heights.forEach((h, k) => {
    candidates.push(h)
    if (k + 1 < heights.length) candidates.push((h + heights[k + 1]) / 2)
  })
  const frames = []
  let best = 0
  const push = (phase, extra, activeText, pyText, message) => {
    frames.push({
      phase, h: null, hits: 0, crossings: [], point: -1, segment: -1, candidate: -1, best,
      ...extra, message,
      activeLine: L(activeText), pythonLine: P(pyText),
    })
  }

  push('start', { heights }, 'let heights be the sorted', 'heights = sorted', `Points sit at heights ${heights.join(', ')}. Candidate lines sit on each height and between neighbours.`)

  candidates.forEach((h, c) => {
    let hits = 0
    const crossings = []
    push('candidate', { h, candidate: c, hits: 0 }, 'for each candidate line height', 'for h in candidates', `Try the line at height ${h}.`)
    for (let i = 0; i < n; i++) {
      if (y[i] === h) {
        hits += 1
        crossings.push({ x: i, kind: 'vertex' })
        push('point', { h, candidate: c, hits, crossings: [...crossings], point: i }, 'if y[i] equals h', 'if y[i] == h', `Point ${i} sits on the line, so it counts once.`)
      }
    }
    for (let i = 0; i + 1 < n; i++) {
      const lo = Math.min(y[i], y[i + 1])
      const hi = Math.max(y[i], y[i + 1])
      if (lo < h && h < hi) {
        hits += 1
        const x = i + (h - y[i]) / (y[i + 1] - y[i])
        crossings.push({ x, kind: 'cross' })
        push('segment', { h, candidate: c, hits, crossings: [...crossings], segment: i }, 'if h is strictly between', 'if min(y[i], y[i + 1]) < h', `Segment ${i} to ${i + 1} crosses height ${h} inside its span.`)
      }
    }
    if (hits > best) best = hits
    push('best', { h, candidate: c, hits, crossings: [...crossings] }, 'if hits is greater than best', 'best = max(best, hits)',
      `Line ${h} meets the chart ${hits} time${hits === 1 ? '' : 's'}. Best is ${best}.`)
  })

  frames.push({
    phase: 'done', h: null, hits: best, crossings: [], point: -1, segment: -1, candidate: -1, best,
    message: `The most intersections with one horizontal line is ${best}.`,
    activeLine: L('return best'), pythonLine: P('return best'),
  })
  return { input: y, result: best, frames }
}
