export function parseInput(text) {
  const input = JSON.parse(text)
  const ranks = input?.ranks
  if (!Array.isArray(ranks) || ranks.length < 1 || ranks.length > 4) throw new Error('Give ranks as an array of 1 to 4 mechanics.')
  if (ranks.some(v => !Number.isInteger(v) || v < 1 || v > 8)) throw new Error('Each rank is an integer from 1 to 8.')
  if (!Number.isInteger(input.cars) || input.cars < 1 || input.cars > 10) throw new Error('cars is an integer from 1 to 10.')
  return { ranks, cars: input.cars }
}

// Largest whole number n with rank * n * n at most t, using only integers.
function carsInTime(rank, t) {
  const q = Math.floor(t / rank)
  let c = Math.floor(Math.sqrt(q))
  while (c * c > q) c--
  while ((c + 1) * (c + 1) <= q) c++
  return c
}

export function buildTrace({ ranks, cars }) {
  let low = 1, high = Math.min(...ranks) * cars * cars
  const frames = [{ phase: 'start', activeLine: L('set low to one'), low, high, mid: null, repaired: null, message: `The fastest mechanic alone needs ${high} minutes at most.` }]
  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    const repaired = ranks.reduce((acc, rank) => acc + carsInTime(rank, mid), 0)
    if (repaired >= cars) high = mid
    else low = mid + 1
    frames.push({ phase: 'probe', activeLine: L('if repaired is at least'), low, high, mid, repaired, message: `In ${mid} minutes the mechanics repair ${repaired} cars, ${repaired >= cars ? 'enough' : 'not enough'} for ${cars}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return low'), low, high, mid: null, repaired: null, message: `The minimum time is ${low} minutes.` })
  return { input: { ranks, cars }, result: low, frames }
}

export const code = `minimum time to repair cars (ranks, cars)
  set low to one and high to min rank times cars squared
  while low is below high
    set mid to the middle of low and high rounded down
    set repaired to the sum over ranks of the largest n where rank times n squared is at most mid
    if repaired is at least cars then
      set high to mid
    otherwise
      set low to mid plus one
  return low`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `import math

def minimum_repair_time(ranks, cars):
    low = 1
    high = min(ranks) * cars * cars
    while low < high:
        mid = (low + high) // 2
        repaired = sum(math.isqrt(mid // rank) for rank in ranks)
        if repaired >= cars:
            high = mid
        else:
            low = mid + 1
    return low
`
