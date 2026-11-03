const MAX_MONSTERS = 6

const P = s => {
  const i = python.split('\n').findIndex(line => line.includes(s))
  if (i < 0) throw new Error(`missing python line: ${s}`)
  return i + 1
}
const L = s => {
  const i = code.findIndex(c => c.text.includes(s))
  if (i < 0) throw new Error(`missing pseudocode line: ${s}`)
  return i + 1
}

export function parseInput(text) {
  const power = JSON.parse(text)
  if (!Array.isArray(power) || power.length < 1 || power.length > MAX_MONSTERS) throw new Error(`Use a list of 1 to ${MAX_MONSTERS} monster powers.`)
  if (!power.every(p => Number.isInteger(p) && p >= 1 && p <= 60)) throw new Error('Each power is an integer from 1 to 60 in this visualization.')
  return power
}

const popcount = mask => {
  let count = 0
  for (let m = mask; m; m &= m - 1) count++
  return count
}

export function buildTrace(power) {
  const n = power.length
  const full = (1 << n) - 1
  const best = Array(1 << n).fill(null)
  const from = Array(1 << n).fill(-1)
  best[0] = 0
  const frames = []
  const snap = extra => ({ best: [...best], power, mask: -1, factor: 1, candidate: -1, picked: -1, days: null, total: null, order: [], ...extra })

  frames.push({ ...snap({ phase: 'start', activeLine: L('best days for the empty set'), pythonLine: P('best = [INF]'), message: `No monster is killed yet, so the growth rate is 1. Subset 0 costs 0 days.` }) })

  for (let mask = 0; mask <= full; mask++) {
    if (best[mask] === null) continue
    const factor = popcount(mask) + 1
    frames.push({ ...snap({ phase: 'settle', mask, factor, activeLine: L('for each set of killed monsters'), pythonLine: P('for mask in range'), message: `Set ${mask.toString(2).padStart(n, '0')} has ${popcount(mask)} killed, so the growth rate is ${factor}.` }) })
    for (let j = 0; j < n; j++) {
      if (mask >> j & 1) continue
      const days = Math.ceil(power[j] / factor)
      const nxt = mask | (1 << j)
      const candidate = best[mask] + days
      const improved = best[nxt] === null || candidate < best[nxt]
      if (improved) {
        best[nxt] = candidate
        from[nxt] = j
      }
      frames.push({ ...snap({ phase: improved ? 'improve' : 'keep', mask, factor, candidate: nxt, days, picked: j, total: candidate, activeLine: L('keep the smaller total'), pythonLine: P('best[nxt] = best[mask] + days'), message: `Monster ${j} (power ${power[j]}) takes ceil(${power[j]} / ${factor}) = ${days} days. ${improved ? `Set ${nxt.toString(2).padStart(n, '0')} now costs ${candidate}.` : `Set ${nxt.toString(2).padStart(n, '0')} keeps its cost ${best[nxt]}.`}` }) })
    }
  }

  const order = []
  for (let m = full; m > 0; m &= ~(1 << from[m])) order.unshift(from[m])
  const total = best[full]
  frames.push({ ...snap({ phase: 'done', mask: full, factor: n + 1, total, order, activeLine: L('return the best total'), pythonLine: P('return best[full]'), message: `Killing in order ${order.join(', ')} takes ${total} days.` }) })
  return { input: power, result: total, frames }
}

export const code = [
  'minimum days to kill every monster',
  'best days for the empty set is zero and every other set is unreached',
  'for each set of killed monsters in increasing order',
  '  the growth rate is the count killed plus one',
  '  for each monster not in the set',
  '    days to kill it is the ceiling of its power over the growth rate',
  '    keep the smaller total for the set with that monster added',
  'return the best total for all monsters',
].map((text, index) => ({ line: index + 1, text }))

export const python = `def minimum_time(power):
    n = len(power)
    full = (1 << n) - 1
    INF = float("inf")
    best = [INF] * (1 << n)
    best[0] = 0
    for mask in range(1 << n):
        if best[mask] == INF:
            continue
        factor = bin(mask).count("1") + 1
        for j in range(n):
            if mask >> j & 1:
                continue
            days = -(-power[j] // factor)
            nxt = mask | (1 << j)
            if best[mask] + days < best[nxt]:
                best[nxt] = best[mask] + days
    return best[full]
`
