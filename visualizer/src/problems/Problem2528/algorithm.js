export function parseInput(text) {
  const input = JSON.parse(text)
  const stations = input?.stations
  if (!Array.isArray(stations) || stations.length < 1 || stations.length > 6) throw new Error('Give stations as an array of 1 to 6 entries.')
  if (stations.some(v => !Number.isInteger(v) || v < 0 || v > 5)) throw new Error('Each station count is an integer from 0 to 5.')
  if (!Number.isInteger(input.r) || input.r < 0 || input.r > 2) throw new Error('r is an integer from 0 to 2.')
  if (!Number.isInteger(input.k) || input.k < 0 || input.k > 4) throw new Error('k is an integer from 0 to 4.')
  return { stations, r: input.r, k: input.k }
}

export const code = `function maximizeMinPower(stations, r, k) {
  const n = stations.length
  const power = stations.map((_, i) => stations.slice(Math.max(0, i - r), Math.min(n, i + r + 1)).reduce((a, b) => a + b, 0))
  const canReach = target => {
    const expire = new Array(n + 1).fill(0)
    let current = 0
    let budget = k
    for (let i = 0; i < n; i++) {
      current -= expire[i]
      const have = power[i] + current
      if (have < target) {
        const need = target - have
        if (need > budget) return false
        budget -= need
        const place = Math.min(i + r, n - 1)
        const end = Math.min(place + r, n - 1)
        current += need
        expire[end + 1] += need
      }
    }
    return true
  }
  let low = Math.min(...power)
  let high = low + k
  while (low < high) {
    const mid = Math.floor((low + high + 1) / 2)
    if (canReach(mid)) low = mid
    else high = mid - 1
  }
  return low
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
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
const PY = python.split('\n')
const py = text => PY.findIndex(line => line.trim() === text) + 1

export function buildTrace({ stations, r, k }) {
  const n = stations.length
  const power = stations.map((_, i) => stations.slice(Math.max(0, i - r), Math.min(n, i + r + 1)).reduce((a, b) => a + b, 0))
  const base = Math.min(...power)
  let low = base, high = base + k
  const frames = []
  const frame = (phase, activeLine, pythonLine, fields) => frames.push({ phase, activeLine, pythonLine, city: -1, target: null, verdict: null, budget: k, low, high, domain: [base, base + k], power, message: '', ...fields })
  frame('start', L('let low = Math.min'), py('low = min(power)'), { message: `Each city's power is the stations within ${r} of it. The answer lies between the weakest city (${base}) and ${base + k}.` })
  const canReach = target => {
    const expire = new Array(n + 1).fill(0)
    let current = 0, budget = k
    for (let i = 0; i < n; i++) {
      current -= expire[i]
      const have = power[i] + current
      if (have < target) {
        const need = target - have
        if (need > budget) {
          frame('check', L('if (need > budget)'), py('return False'), { city: i, target, budget, low, high, message: `City ${i} needs ${need} more station power but only ${budget} stations remain, so ${target} is out of reach.` })
          return false
        }
        budget -= need
        const place = Math.min(i + r, n - 1)
        const end = Math.min(place + r, n - 1)
        current += need
        expire[end + 1] += need
        frame('place', L('expire[end + 1] += need'), py('expire[end + 1] += need'), { city: i, target, budget, low, high, message: `Place ${need} stations at city ${place}. They cover cities up to ${end}, so city ${i} reaches ${target}.` })
      }
    }
    return true
  }
  while (low < high) {
    const mid = Math.floor((low + high + 1) / 2)
    const ok = canReach(mid)
    if (ok) low = mid
    else high = mid - 1
    frame('probe', L('if (canReach(mid))'), py('if can_reach(mid):'), { target: mid, verdict: ok, budget: k, low, high, message: `Target ${mid} ${ok ? 'is reachable, so the answer is at least ' + mid : 'is not reachable, so the answer is below ' + mid}. The range is now ${low} to ${high}.`.replace('${low}', low).replace('${high}', high) })
  }
  frame('done', L('return low'), py('return low'), { low, high, message: `The best minimum power is ${low}.` })
  return { input: { stations, r, k }, result: low, power, frames }
}
