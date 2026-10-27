export function parseInput(text) {
  const input = JSON.parse(text)
  const stations = input?.stations
  if (!Array.isArray(stations) || stations.length < 1 || stations.length > 6) throw new Error('Give stations as an array of 1 to 6 entries.')
  if (stations.some(v => !Number.isInteger(v) || v < 0 || v > 5)) throw new Error('Each station count is an integer from 0 to 5.')
  if (!Number.isInteger(input.r) || input.r < 0 || input.r > 2) throw new Error('r is an integer from 0 to 2.')
  if (!Number.isInteger(input.k) || input.k < 0 || input.k > 4) throw new Error('k is an integer from 0 to 4.')
  return { stations, r: input.r, k: input.k }
}

export function buildTrace({ stations, r, k }) {
  const n = stations.length
  const power = stations.map((_, i) => {
    let sum = 0
    for (let j = Math.max(0, i - r); j <= Math.min(n - 1, i + r); j++) sum += stations[j]
    return sum
  })
  let low = Math.min(...power), high = low + k
  const frames = [{ phase: 'start', activeLine: L('set power to the power'), city: -1, target: null, budget: k, low, high, message: `Each city's power is the stations within ${r} of it. Adding ${k} stations can raise the minimum by at most ${k}.` }]
  const canReach = target => {
    const expire = new Array(n + 1).fill(0)
    let current = 0, budget = k
    for (let i = 0; i < n; i++) {
      current -= expire[i]
      const have = power[i] + current
      if (have < target) {
        const need = target - have
        if (need > budget) {
          frames.push({ phase: 'check', activeLine: L('if there are too few stations left'), city: i, target, budget, low, high, message: `City ${i} needs ${need} more but only ${budget} remain.` })
          return false
        }
        budget -= need
        const place = Math.min(i + r, n - 1)
        const end = Math.min(place + r, n - 1)
        current += need
        expire[end + 1] += need
        frames.push({ phase: 'place', activeLine: L('place the missing stations'), city: i, target, budget, low, high, message: `Place ${need} stations at city ${place} to lift city ${i} to ${target}.` })
      }
    }
    return true
  }
  while (low < high) {
    const mid = Math.floor((low + high + 1) / 2)
    const ok = canReach(mid)
    if (ok) low = mid
    else high = mid - 1
    frames.push({ phase: 'probe', activeLine: L('if mid cities'), city: -1, target: mid, budget: k, low, high, message: `Target ${mid} ${ok ? 'is reachable' : 'is not reachable'}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return low'), city: -1, target: null, budget: k, low, high, message: `The best minimum power is ${low}.` })
  return { input: { stations, r, k }, result: low, power, frames }
}

export const code = `maximize the minimum powered city (stations, r, k)
  set power to the power of every city
  set low to the smallest power and high to that plus k
  while low is below high
    set mid to the middle of low and high rounded up
    if mid cities can all reach mid power then set low to mid
    otherwise set high to mid minus one
  return low
can all cities reach target
  set expiry list and extra coverage to zero
  set budget to k
  for each city i from left to right
    remove stations that no longer cover city i
    if city i is short of target then
      place the missing stations at the furthest useful city
      if there are too few stations left then return false
  return true`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximize_min_power(stations, r, k):
    n = len(stations)
    power = [sum(stations[max(0, i - r):min(n, i + r + 1)]) for i in range(n)]
    def can_reach(target):
        expire = [0] * (n + 1)
        current = 0
        budget = k
        for i in range(n):
            current -= expire[i]
            have = power[i] + current
            if have < target:
                need = target - have
                if need > budget:
                    return False
                budget -= need
                place = min(i + r, n - 1)
                end = min(place + r, n - 1)
                current += need
                expire[end + 1] += need
        return True
    low = min(power)
    high = low + k
    while low < high:
        mid = (low + high + 1) // 2
        if can_reach(mid):
            low = mid
        else:
            high = mid - 1
    return low
`
