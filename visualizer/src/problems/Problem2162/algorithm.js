// LeetCode 2162: Minimum Cost to Set Cooking Time.
// Every way to show the target is minutes * 60 + seconds with minutes and seconds at most 99. The display
// digits are minutes * 100 + seconds written without leading zeros. Pushing a digit costs pushCost, and the
// finger costs moveCost whenever the digit differs from the one it is currently on (starting from startAt).
// Try every representation and keep the cheapest.

export function parseInput(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"startAt":1,"moveCost":2,"pushCost":1,"targetSeconds":600}.') }
  const { startAt, moveCost, pushCost, targetSeconds } = data ?? {}
  if (!Number.isInteger(startAt) || startAt < 0 || startAt > 9) throw new Error('startAt is a digit from 0 to 9.')
  if (!Number.isInteger(moveCost) || moveCost < 1 || moveCost > 100) throw new Error('moveCost is an integer from 1 to 100.')
  if (!Number.isInteger(pushCost) || pushCost < 1 || pushCost > 100) throw new Error('pushCost is an integer from 1 to 100.')
  if (!Number.isInteger(targetSeconds) || targetSeconds < 1 || targetSeconds > 6039) throw new Error('targetSeconds is an integer from 1 to 6039.')
  return { startAt, moveCost, pushCost, targetSeconds }
}

export const code = `function minCostSetTime(startAt, moveCost, pushCost, targetSeconds) {
  let best = Infinity
  for (let minutes = 0; minutes <= 99; minutes++) {
    const seconds = targetSeconds - minutes * 60
    if (seconds < 0 || seconds > 99) continue
    const digits = String(minutes * 100 + seconds)
    let cost = 0
    let finger = startAt
    for (const ch of digits) {
      const digit = Number(ch)
      if (digit !== finger) cost += moveCost
      cost += pushCost
      finger = digit
    }
    best = Math.min(best, cost)
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: min_cost_set_time
def min_cost_set_time(startAt, moveCost, pushCost, targetSeconds):
    best = float("inf")
    for minutes in range(100):
        seconds = targetSeconds - minutes * 60
        if seconds < 0 or seconds > 99:
            continue
        digits = str(minutes * 100 + seconds)
        cost = 0
        finger = startAt
        for ch in digits:
            digit = int(ch)
            if digit != finger:
                cost += moveCost
            cost += pushCost
            finger = digit
        best = min(best, cost)
    return best
`

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

export const phases = [
  { id: 'candidate', label: 'Candidate', description: 'One way to show the target as minutes and seconds.' },
  { id: 'cost', label: 'Price the presses', description: 'Each digit costs a push, and a move when the finger changes digit.' },
  { id: 'best', label: 'Keep cheapest', description: 'The cheapest candidate so far.' },
  { id: 'done', label: 'Result', description: 'The minimum cost over all candidates.' },
]

export function buildTrace({ startAt, moveCost, pushCost, targetSeconds }) {
  const frames = []
  const rows = []
  let best = Infinity
  for (let minutes = 0; minutes <= 99; minutes++) {
    const seconds = targetSeconds - minutes * 60
    if (seconds < 0 || seconds > 99) continue
    const digits = String(minutes * 100 + seconds)
    let cost = 0
    let finger = startAt
    for (const ch of digits) {
      const digit = Number(ch)
      if (digit !== finger) cost += moveCost
      cost += pushCost
      finger = digit
    }
    const isBest = cost < best
    if (isBest) best = cost
    rows.push({ minutes, seconds, digits, cost, best })
    frames.push({ phase: isBest ? 'best' : 'cost', activeLine: L('const digits'), pythonLine: P('digits = str'), message: `${minutes}:${String(seconds).padStart(2, '0')} is pushed as ${digits}, costing ${cost}${isBest ? ', the cheapest so far' : ''}.`, rows: rows.map(r => ({ ...r })), best })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), pythonLine: P('return best'), message: `Minimum cost: ${best}.`, rows: rows.map(r => ({ ...r })), best })
  return { input: { startAt, moveCost, pushCost, targetSeconds }, result: best, frames }
}
