export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with l, n, k, position and time, for example {"l":10,"n":4,"k":1,"position":[0,3,8,10],"time":[5,8,3,6]}.')
  const { l, n, k, position, time } = data
  if (!Number.isInteger(l) || l < 1 || l > 100) throw new Error('l must be an integer from 1 to 100.')
  if (!Number.isInteger(n) || n < 2 || n > 12) throw new Error('n must be an integer from 2 to 12.')
  if (!Number.isInteger(k) || k < 0 || k > n - 2) throw new Error('k must be an integer from 0 to n - 2.')
  if (!Array.isArray(position) || position.length !== n) throw new Error('position must have n entries.')
  if (!Array.isArray(time) || time.length !== n) throw new Error('time must have n entries.')
  if (position[0] !== 0 || position[n - 1] !== l) throw new Error('position must start at 0 and end at l.')
  for (let i = 0; i < n; i++) {
    if (!Number.isInteger(position[i]) || (i > 0 && position[i] <= position[i - 1])) throw new Error('position must be strictly increasing integers.')
    if (!Number.isInteger(time[i]) || time[i] < 1 || time[i] > 100) throw new Error('Each time is an integer from 1 to 100.')
  }
  if (time.reduce((sum, t) => sum + t, 0) > 100) throw new Error('The times must sum to at most 100.')
  return { l, n, k, position: [...position], time: [...time] }
}

export function buildTrace(input) {
  const { n, k, position, time } = input
  const pre = [0]
  for (const t of time) pre.push(pre[pre.length - 1] + t)
  // A state is keyed by (previous kept sign p, kept sign a, merges so far c); its value is the road cost so far.
  const dp = new Map()
  const key = (p, a, c) => `${p},${a},${c}`
  dp.set(key(-1, 0, 0), 0)
  const frames = [{ phase: 'start', activeLine: L('set the start state'), a: 0, best: null, message: 'Start at sign 0 with no merges. A state remembers the previous kept sign, the current kept sign, and how many signs were merged away.' }]
  for (let a = 0; a < n - 1; a++) {
    const here = [...dp.entries()].filter(([state]) => state.split(',')[1] === String(a))
    for (const [state, cost] of here) {
      const [p, , c] = state.split(',').map(Number)
      const carry = pre[a + 1] - pre[p + 1]
      for (let b = a + 1; b < n; b++) {
        const c2 = c + (b - a - 1)
        if (c2 > k) break
        const next = cost + (position[b] - position[a]) * carry
        const nk = key(a, b, c2)
        if (!dp.has(nk) || next < dp.get(nk)) dp.set(nk, next)
      }
    }
    frames.push({ phase: 'extend', activeLine: L('for each kept sign a'), a, best: null, message: `Sign ${a} is kept. Price the road from it to each later kept sign b; the signs in between are merged away and their time moves forward.` })
  }
  let best = null
  for (const [state, cost] of dp) {
    const [, a, c] = state.split(',').map(Number)
    if (a === n - 1 && c === k && (best === null || cost < best)) best = cost
  }
  frames.push({ phase: 'done', activeLine: L('return best'), a: n - 1, best, message: `The cheapest travel time with exactly ${k} merges is ${best}.` })
  return { input, result: best, frames }
}

export const code = `merge travel time (l, n, k, position, time)
  set the start state to a previous sign of none, sign 0, and 0 merges, with cost 0
  for each kept sign a from 0 to n - 2
    for each state that keeps sign a with c merges so far
      for each later kept sign b
        the signs between a and b are merged away, so the count becomes c plus (b - a - 1)
        if the count is more than k then stop trying later b
        carry is the time from the previous kept sign through a
        road cost is (position[b] - position[a]) times carry
        keep the cheapest cost for the state that keeps b with previous sign a
  set best to the cheapest state that reaches sign n - 1 with exactly k merges
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_travel_time(l, n, k, position, time):
    pre = [0]
    for t in time:
        pre.append(pre[-1] + t)
    INF = float('inf')
    # state (p, a, c): sign a is kept, p is the previous kept sign (-1 for none), c signs were merged away
    dp = {(-1, 0, 0): 0}
    for a in range(n - 1):
        for (p, a2, c), cost in list(dp.items()):
            if a2 != a:
                continue
            carry = pre[a + 1] - pre[p + 1]
            for b in range(a + 1, n):
                c2 = c + (b - a - 1)
                if c2 > k:
                    break
                new = cost + (position[b] - position[a]) * carry
                if new < dp.get((a, b, c2), INF):
                    dp[(a, b, c2)] = new
    return min((cost for (p, a, c), cost in dp.items() if a == n - 1 and c == k), default=None)
`
