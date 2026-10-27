export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with eventTime, startTime, endTime, and k.')
  const { eventTime, startTime, endTime, k } = data
  if (!Number.isInteger(eventTime) || eventTime < 1 || eventTime > 1000) throw new Error('eventTime is an integer from 1 to 1000.')
  if (!Array.isArray(startTime) || !Array.isArray(endTime) || startTime.length !== endTime.length) throw new Error('startTime and endTime must be arrays of the same length.')
  const n = startTime.length
  if (n < 1 || n > 8) throw new Error('The visualization covers 1 to 8 meetings.')
  if (![...startTime, ...endTime].every(v => Number.isInteger(v) && v >= 0 && v <= eventTime)) throw new Error('Times are integers from 0 to eventTime.')
  for (let i = 0; i < n; i++) {
    if (startTime[i] >= endTime[i]) throw new Error('Each meeting must start before it ends.')
    if (i > 0 && startTime[i] < endTime[i - 1]) throw new Error('Meetings must not overlap and must be in order.')
  }
  if (!Number.isInteger(k) || k < 0 || k > n) throw new Error('k is an integer from 0 to the number of meetings.')
  return { eventTime, startTime, endTime, k }
}

export function buildTrace(input) {
  const { eventTime, startTime, endTime, k } = input
  const n = startTime.length
  // gaps[i] is the free time before meeting i (gaps[n] is the time after the last meeting).
  const gaps = []
  let previous = 0
  for (let i = 0; i < n; i++) {
    gaps.push(startTime[i] - previous)
    previous = endTime[i]
  }
  gaps.push(eventTime - previous)
  let best = Math.max(...gaps)
  const frames = [{ phase: 'start', activeLine: L('set gaps to'), gaps, from: null, to: null, total: null, best, message: `The largest single gap is ${best}.` }]
  for (let l = 0; l < n; l++) {
    for (let r = l; r < n && r - l + 1 <= k; r++) {
      let total = 0
      for (let g = l; g <= r + 1; g++) total += gaps[g]
      frames.push({ phase: 'window', activeLine: L('set total to'), gaps, from: l, to: r, total, best, message: `Moving meetings ${l} to ${r} merges gaps ${l} to ${r + 1} into ${total}.` })
      best = Math.max(best, total)
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), gaps, from: null, to: null, total: null, best, message: `Largest free time: ${best}.` })
  return { input, result: best, frames }
}

export const code = `largest free time after moving at most k meetings, keeping their order
  set gaps to the free times before, between, and after the meetings
  set best to the largest single gap
  for each run of consecutive meetings from l to r that has at most k meetings
    set total to the sum of gaps from gap l through gap r + 1
    set best to the larger of best and total
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_free_time(eventTime, startTime, endTime, k):
    n = len(startTime)
    gaps = []
    previous = 0
    for i in range(n):
        gaps.append(startTime[i] - previous)
        previous = endTime[i]
    gaps.append(eventTime - previous)

    best = max(gaps)
    for l in range(n):
        for r in range(l, n):
            if r - l + 1 > k:
                break
            best = max(best, sum(gaps[l:r + 2]))
    return best
`
