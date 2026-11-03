export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with an intervals list.')
  const { intervals } = input
  if (!Array.isArray(intervals) || intervals.length < 1 || intervals.length > 12) throw new Error('intervals lists 1 to 12 [start, end] pairs.')
  for (const pair of intervals) {
    if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(v => Number.isInteger(v) && v >= 0 && v <= 20) || pair[0] > pair[1]) {
      throw new Error('Each interval is [start, end] with integers from 0 to 20 and start at most end.')
    }
  }
  return { intervals }
}

// Closed intervals overlap when they share at least one point. A team is valid when one member (the centre)
// overlaps every other member, so the best team around a centre is all intervals that overlap it.
export function buildTrace({ intervals }) {
  const frames = []
  const n = intervals.length
  const overlaps = (a, b) => Math.max(a[0], b[0]) <= Math.min(a[1], b[1])
  const snap = extra => extra
  let best = 0
  let bestCentre = -1
  let bestTeam = []
  frames.push(snap({ pythonLine: PY('best = 0'), phase: 'start', activeLine: L('best = 0'), centre: -1, other: -1, team: [], size: 0, best: 0, bestTeam: [], message: `${n} closed interval${n === 1 ? '' : 's'}; try each as the centre.` }))
  for (let c = 0; c < n; c += 1) {
    let size = 0
    const team = []
    frames.push(snap({ pythonLine: PY('for c1, c2 in intervals'), phase: 'centre', activeLine: L('for each candidate centre'), centre: c, other: -1, team: [], size: 0, best, bestTeam: bestTeam.slice(), message: `Centre ${c}: [${intervals[c].join(', ')}].` }))
    for (let o = 0; o < n; o += 1) {
      const hit = overlaps(intervals[c], intervals[o])
      if (hit) {
        size += 1
        team.push(o)
      }
      frames.push(snap({ pythonLine: PY('if max(c1, s1)'), phase: hit ? 'hit' : 'miss', activeLine: L('if the two intervals share a point'), centre: c, other: o, team: team.slice(), size, best, bestTeam: bestTeam.slice(), message: `${hit ? 'Overlaps' : 'Misses'} member ${o} [${intervals[o].join(', ')}]; team size ${size}.` }))
    }
    if (size > best) {
      best = size
      bestCentre = c
      bestTeam = team.slice()
      frames.push(snap({ pythonLine: PY('best = max(best, size)'), phase: 'best', activeLine: L('keep the larger team'), centre: c, other: -1, team: team.slice(), size, best, bestTeam: bestTeam.slice(), message: `New best team of ${best} around centre ${c}.` }))
    }
  }
  frames.push(snap({ pythonLine: PY('return best'), phase: 'done', activeLine: L('return best'), centre: bestCentre, other: -1, team: bestTeam.slice(), size: best, best, bestTeam: bestTeam.slice(), message: `Largest team: ${best}.` }))
  return { input: { intervals }, result: best, frames }
}

export const code = `largest team size with overlapping closed intervals
  best = 0
  for each candidate centre c
    size = 0
    for each interval o
      if the two intervals share a point then add one to size
    keep the larger team in best
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def max_team(intervals):
    best = 0
    for c1, c2 in intervals:
        size = 0
        for s1, s2 in intervals:
            if max(c1, s1) <= min(c2, s2):
                size += 1
        best = max(best, size)
    return best
`

const PY = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}
