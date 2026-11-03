// A chain of chosen meetings earns its revenues plus the idle gaps between consecutive meetings.
// Appending meeting j after meeting i adds start[j] - end[i] + revenue[j]. So for each meeting j, the best chain
// ending at j is revenue[j] plus the best (dp[i] - end[i]) over finished meetings, plus start[j].
// Meetings are processed by start time; a meeting joins the pool once it ends at or before the current start.

const MAX_LENGTH = 12

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const meetings = JSON.parse(text)
  if (!Array.isArray(meetings) || meetings.length < 1 || meetings.length > MAX_LENGTH) throw new Error('Use an array of 1 to 12 [start, end, revenue] triples.')
  for (const m of meetings) {
    if (!Array.isArray(m) || m.length !== 3 || !m.every(Number.isInteger)) throw new Error('Each meeting is [start, end, revenue] with integers.')
    const [start, end, revenue] = m
    if (start < 0 || end <= start || end > 1000000000 || revenue < 1 || revenue > 1000000000) {
      throw new Error('Need 0 <= start < end <= 1000000000 and revenue from 1 to 1000000000.')
    }
  }
  return meetings
}

export function buildTrace(meetings) {
  const n = meetings.length
  const byStart = meetings.map((_, k) => k).sort((x, y) => meetings[x][0] - meetings[y][0] || x - y)
  const byEnd = meetings.map((_, k) => k).sort((x, y) => meetings[x][1] - meetings[y][1] || x - y)
  const dp = new Array(n).fill(null)
  const frames = []
  let best = null
  let bestFrom = null
  let p = 0
  const pool = []
  frames.push({
    phase: 'sort', activeLine: L('order ← meetings sorted by start'), pythonLine: P('order = sorted'),
    current: null, pool: [], dp: [...dp], best: null, bestFrom: null, from: null, result: null,
    message: 'Meetings are ordered by start time. A meeting can only follow one that ends no later than it starts.',
  })
  for (const j of byStart) {
    const [start, , revenue] = meetings[j]
    while (p < n && meetings[byEnd[p]][1] <= start) {
      const i = byEnd[p]
      const value = dp[i] - meetings[i][1]
      if (best === null || value > best) {
        best = value
        bestFrom = i
      }
      pool.push(i)
      frames.push({
        phase: 'pool', activeLine: L('best ← larger of best'), pythonLine: P('best = value'),
        current: j, pool: [...pool], dp: [...dp], best, bestFrom, from: i, result: null,
        message: `Meeting ${i} ends at ${meetings[i][1]}, no later than ${start}. Its candidate value is ${value}.`,
      })
      p++
    }
    dp[j] = best === null ? revenue : revenue + best + start
    frames.push({
      phase: 'extend', activeLine: L('dp[j] ← revenue'), pythonLine: P('dp[j] = revenue'),
      current: j, pool: [...pool], dp: [...dp], best, bestFrom, from: best === null ? null : bestFrom, result: null,
      message: best === null
        ? `Meeting ${j} has no finished meeting before it, so its best chain is its own revenue ${revenue}.`
        : `Meeting ${j} follows meeting ${bestFrom}: revenue ${revenue} plus gap and earnings give ${dp[j]}.`,
    })
  }
  const result = Math.max(...dp)
  frames.push({
    phase: 'done', activeLine: L('RETURN the largest'), pythonLine: P('return max(dp)'),
    current: null, pool: [], dp: [...dp], best, bestFrom, from: null, result,
    message: `Best total earnings: ${result}.`,
  })
  return { input: meetings, result, frames }
}

export const code = `FUNCTION maxEarnings(meetings)
    order ← meetings sorted by start time
    byEnd ← meetings sorted by end time
    best ← none; p ← 0
    FOR each meeting j in order
        WHILE byEnd[p] ends at or before the start of j
            best ← larger of best and dp[byEnd[p]] − end of byEnd[p]
            p ← p + 1
        dp[j] ← revenue of j, plus best + start of j when best exists
    RETURN the largest dp value`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def max_earnings(meetings):
    order = sorted(range(len(meetings)), key=lambda k: meetings[k][0])
    by_end = sorted(range(len(meetings)), key=lambda k: meetings[k][1])
    dp = [0] * len(meetings)
    best = None
    p = 0
    for j in order:
        start, end, revenue = meetings[j]
        while p < len(by_end) and meetings[by_end[p]][1] <= start:
            i = by_end[p]
            value = dp[i] - meetings[i][1]
            if best is None or value > best:
                best = value
            p += 1
        dp[j] = revenue if best is None else revenue + best + start
    return max(dp)


if __name__ == "__main__":
    import json
    import sys
    print(max_earnings(json.loads(sys.stdin.read())))
`
