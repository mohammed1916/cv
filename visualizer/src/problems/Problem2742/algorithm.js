export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).sort().join() !== 'cost,time') {
    throw new Error('Use an object with exactly the keys cost and time.')
  }
  const { cost, time } = data
  if (!Array.isArray(cost) || !Array.isArray(time) || cost.length < 1 || cost.length > 10 || time.length !== cost.length) {
    throw new Error('cost and time must have the same length, from 1 to 10.')
  }
  if (cost.some(v => !Number.isInteger(v) || v < 1 || v > 100)) throw new Error('Each cost is an integer from 1 to 100.')
  if (time.some(v => !Number.isInteger(v) || v < 1 || v > 10)) throw new Error('Each time is an integer from 1 to 10.')
  return data
}

export function buildTrace(data) {
  const { cost, time } = data
  const n = cost.length
  // best[c]: cheapest way, over the walls seen so far, to cover c walls (capped at n).
  let best = Array(n + 1).fill(Infinity)
  best[0] = 0
  const frames = [{ phase: 'start', activeLine: L('set best[0]'), wall: null, best: [...best], message: 'Covering 0 walls costs 0. Every other count is not reachable yet.' }]
  for (let i = 0; i < n; i++) {
    const next = best.slice()
    for (let c = 0; c <= n; c++) {
      if (best[c] === Infinity) continue
      const covered = Math.min(n, c + time[i] + 1)
      next[covered] = Math.min(next[covered], best[c] + cost[i])
    }
    best = next
    frames.push({ phase: 'wall', activeLine: L('for each wall i'), wall: i, best: [...best], message: `Wall ${i + 1} costs ${cost[i]} and lets the free painter cover ${time[i] + 1} walls while it is painted.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best[n]'), wall: null, best: [...best], message: `The cheapest way to cover all ${n} walls costs ${best[n]}.` })
  return { input: data, result: best[n], frames }
}

export const code = `minimum cost to paint all walls with a paid and a free painter:
  set best[0] to 0 and every other best entry to infinity
  for each wall i:
    copy best into next
    for each covered count c that is reachable:
      paying for wall i covers min(n, c + time[i] + 1) walls
      set next[that count] to the cheaper of its value and best[c] + cost[i]
    replace best with next
  return best[n]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def paint_cost(cost, time):
    n = len(cost)
    inf = float('inf')
    best = [inf] * (n + 1)
    best[0] = 0
    for i in range(n):
        nxt = best[:]
        for c in range(n + 1):
            if best[c] == inf:
                continue
            covered = min(n, c + time[i] + 1)
            nxt[covered] = min(nxt[covered], best[c] + cost[i])
        best = nxt
    return best[n]
`
