export function parseInput(text) {
  const data = JSON.parse(text)
  const dist = data?.dist
  const { speed, hours_before: hoursBefore } = data ?? {}
  if (!Array.isArray(dist) || dist.length < 1 || dist.length > 5 || dist.some(d => !Number.isInteger(d) || d < 1 || d > 9)) {
    throw new Error('dist must be 1 to 5 road lengths, each an integer from 1 to 9.')
  }
  if (!Number.isInteger(speed) || speed < 1 || speed > 4) throw new Error('speed must be an integer from 1 to 4.')
  if (!Number.isInteger(hoursBefore) || hoursBefore < 1 || hoursBefore > 12) throw new Error('hours_before must be an integer from 1 to 12.')
  return { dist, speed, hours_before: hoursBefore }
}

export const code = `minimum skips(dist, speed, hours_before)
  times[0] = 0, and times[j] = infinity for every other skip count j
  for each road index i with distance d
    nextTimes = infinity for every skip count
    for each skip count j with a finite time
      arrive = times[j] + d
      if this is the last road then nextTimes[j] = min(nextTimes[j], arrive)
      otherwise, resting rounds up: nextTimes[j] = min(nextTimes[j], arrive rounded up to whole hours)
      otherwise, skipping the rest: nextTimes[j + 1] = min(nextTimes[j + 1], arrive)
    times = nextTimes
  for j from 0 to len(dist)
    if times[j] is at most hours_before * speed then return j
  return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// Times are kept as numerators over speed, so rounding up to whole hours is exact integer arithmetic.
export function buildTrace({ dist, speed, hours_before: hoursBefore }) {
  const n = dist.length
  const limit = hoursBefore * speed
  let times = Array(n + 1).fill(Infinity)
  times[0] = 0
  const show = list => list.map(t => (Number.isFinite(t) ? t / speed : null))
  const frames = [{ phase: 'start', road: -1, times: show(times), activeLine: L('times[0] = 0'), message: 'With no roads driven, time is zero and no rests have been skipped.' }]
  dist.forEach((d, i) => {
    const next = Array(n + 1).fill(Infinity)
    for (let j = 0; j <= i; j++) {
      if (!Number.isFinite(times[j])) continue
      const arrive = times[j] + d
      if (i === n - 1) {
        next[j] = Math.min(next[j], arrive)
        frames.push({ phase: 'last', road: i, times: show(next), activeLine: L('if this is the last road'), message: `The last road ends at ${arrive / speed} hours with ${j} skips.` })
        continue
      }
      const rounded = Math.ceil(arrive / speed) * speed
      next[j] = Math.min(next[j], rounded)
      next[j + 1] = Math.min(next[j + 1], arrive)
      frames.push({ phase: 'rest', road: i, times: show(next), activeLine: L('otherwise, resting rounds up'), message: `Road ${i} with ${j} skips: resting rounds to ${rounded / speed} hours; skipping keeps ${arrive / speed}.` })
    }
    times = next
  })
  let result = -1
  for (let j = 0; j <= n; j++) {
    if (times[j] <= limit) { result = j; break }
  }
  frames.push({ phase: 'done', road: -1, times: show(times), activeLine: L('return -1'), message: result === -1 ? 'No skip count reaches the meeting in time.' : `Fewest skips: ${result}.` })
  return { input: { dist, speed, hours_before: hoursBefore }, result, frames }
}

export const python = `import math

def min_skips(dist, speed, hours_before):
    n = len(dist)
    INF = float('inf')
    times = [INF] * (n + 1)
    times[0] = 0
    for i, d in enumerate(dist):
        nxt = [INF] * (n + 1)
        for j in range(i + 1):
            if times[j] == INF:
                continue
            arrive = times[j] + d
            if i == n - 1:
                nxt[j] = min(nxt[j], arrive)
            else:
                rounded = math.ceil(arrive / speed) * speed
                nxt[j] = min(nxt[j], rounded)
                nxt[j + 1] = min(nxt[j + 1], arrive)
        times = nxt
    limit = hours_before * speed
    for j in range(n + 1):
        if times[j] <= limit:
            return j
    return -1
`
