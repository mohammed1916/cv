export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).sort().join() !== 'events,k') {
    throw new Error('Use an object with exactly the keys events and k.')
  }
  const { events, k } = data
  if (!Number.isInteger(k) || k < 1 || k > 4) throw new Error('k is an integer from 1 to 4.')
  if (!Array.isArray(events) || events.length < 1 || events.length > 8) throw new Error('Use 1 to 8 events.')
  for (const event of events) {
    if (!Array.isArray(event) || event.length !== 3 || !event.every(Number.isInteger)) throw new Error('Each event is [start, end, value] with integers.')
    if (event[0] < 1 || event[0] > event[1] || event[1] > 20) throw new Error('Days must satisfy 1 <= start <= end <= 20.')
    if (event[2] < 1 || event[2] > 1000000) throw new Error('Each value is from 1 to 1000000.')
  }
  return data
}

export function buildTrace(data) {
  const events = data.events.map(event => [...event]).sort((a, b) => a[1] - b[1] || a[0] - b[0] || a[2] - b[2])
  const n = events.length
  const k = data.k
  // prev[i]: how many sorted events end before event i (1-based) starts. The sort makes these a prefix.
  const prev = [0]
  for (let i = 1; i <= n; i++) {
    const start = events[i - 1][0]
    let count = 0
    while (count < n && events[count][1] < start) count++
    prev.push(count)
  }
  const dp = Array.from({ length: n + 1 }, () => Array(k + 1).fill(0))
  const snapshot = () => dp.map(row => [...row])
  const frames = [{ phase: 'start', activeLine: L('set dp[0][j]'), i: 0, j: 0, table: snapshot(), prev, events, message: 'With no events the value is 0 for every attendance count.' }]
  for (let i = 1; i <= n; i++) {
    const [start, end, value] = events[i - 1]
    for (let j = 1; j <= k; j++) {
      const skip = dp[i - 1][j]
      const attend = value + dp[prev[i]][j - 1]
      dp[i][j] = Math.max(skip, attend)
      frames.push({ phase: 'cell', activeLine: L('keep the better'), i, j, table: snapshot(), prev, events, message: `Event ${i} (days ${start}-${end}, value ${value}): skip gives ${skip}, attend after ${prev[i]} earlier events gives ${attend}. Keep ${dp[i][j]}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return dp[n][k]'), i: n, j: k, table: snapshot(), prev, events, message: `The best total value with at most ${k} events is ${dp[n][k]}.` })
  return { input: data, result: dp[n][k], frames, events, prev }
}

export const code = `maximum total value with at most k attended events:
  sort the events by their end day
  for each event i, count the events that end before it starts
  set dp[0][j] to 0 for every attendance count j
  for each event i from 1 to n:
    for each attendance count j from 1 to k:
      skip event i, or attend it after the prev[i] events
      keep the better of the two in dp[i][j]
  return dp[n][k]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_value(events, k):
    events = sorted(events, key=lambda e: e[1])
    n = len(events)
    prev = [0] * (n + 1)
    for i in range(1, n + 1):
        start = events[i - 1][0]
        count = 0
        while count < n and events[count][1] < start:
            count += 1
        prev[i] = count
    dp = [[0] * (k + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        value = events[i - 1][2]
        for j in range(1, k + 1):
            dp[i][j] = max(dp[i - 1][j], value + dp[prev[i]][j - 1])
    return dp[n][k]
`
