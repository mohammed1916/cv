export const phases = [
  { id: 'start', label: 'Room 0', description: 'Day 0 is the first visit to room 0; the first arrival time of room 0 is 0.' },
  { id: 'room', label: 'Cost of room i', description: 'Leaving room i for the first time costs 2 days plus the cost of every room from nextVisit[i] up to i - 1.' },
  { id: 'arrive', label: 'First arrival', description: 'The first arrival at room i + 1 comes dp[i] days after the first arrival at room i.' },
  { id: 'done', label: 'Result', description: 'The last room is first reached on the day given by the sum of the costs of all rooms before it.' },
]

export const code = `function firstDayAllRooms(nextVisit) {
  const MOD = 1000000007
  const n = nextVisit.length
  const dp = new Array(n).fill(0)
  const prefix = new Array(n + 1).fill(0)
  for (let i = 0; i < n - 1; i++) {
    dp[i] = (2 + prefix[i] - prefix[nextVisit[i]] + MOD) % MOD
    prefix[i + 1] = (prefix[i] + dp[i]) % MOD
  }
  return prefix[n - 1]
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def first_day_all_rooms(next_visit):
    MOD = 1000000007
    n = len(next_visit)
    dp = [0] * n
    prefix = [0] * (n + 1)
    for i in range(n - 1):
        dp[i] = (2 + prefix[i] - prefix[next_visit[i]] + MOD) % MOD
        prefix[i + 1] = (prefix[i] + dp[i]) % MOD
    return prefix[n - 1]
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let nextVisit
  try { nextVisit = JSON.parse(text) } catch { throw new Error('Use a JSON array such as [0,0,2].') }
  if (!Array.isArray(nextVisit) || nextVisit.length < 2 || nextVisit.length > 12) throw new Error('nextVisit must have 2 to 12 entries here.')
  if (!nextVisit.every((v, i) => Number.isInteger(v) && v >= 0 && v <= i)) throw new Error('Each nextVisit[i] must be a room number from 0 to i.')
  return nextVisit
}

export function buildTrace(nextVisit) {
  const MOD = 1000000007
  const n = nextVisit.length
  const frames = []
  const dp = new Array(n).fill(0)
  const prefix = new Array(n + 1).fill(0)
  const arrival = new Array(n).fill(null)
  arrival[0] = 0
  const add = (phase, c, p, message, room) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { nextVisit, room, dp: dp.slice(), arrival: arrival.slice(), n },
  })
  add('start', 'const dp', 'dp = [0]', 'Room 0 is first reached on day 0.', 0)
  for (let i = 0; i < n - 1; i++) {
    dp[i] = (2 + prefix[i] - prefix[nextVisit[i]] + MOD) % MOD
    prefix[i + 1] = (prefix[i] + dp[i]) % MOD
    add('room', 'dp[i] = (2', 'dp[i] = (2', `Room ${i}: 2 days plus the costs of rooms ${nextVisit[i]} to ${i - 1 >= nextVisit[i] ? i - 1 : 'none'} give ${dp[i]}.`, i)
    arrival[i + 1] = prefix[i + 1]
    add('arrive', 'prefix[i + 1]', 'prefix[i + 1]', `Room ${i + 1} is first reached on day ${arrival[i + 1]}.`, i + 1)
  }
  add('done', 'return prefix[n - 1]', 'return prefix[n - 1]', `All rooms are first visited by day ${prefix[n - 1]}.`, n - 1)
  return { input: nextVisit, result: prefix[n - 1], frames }
}
