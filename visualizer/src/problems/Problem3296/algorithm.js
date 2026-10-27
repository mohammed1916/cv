export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with mountainHeight and workerTimes (an array).')
  const { mountainHeight, workerTimes } = data
  if (!Number.isInteger(mountainHeight) || mountainHeight < 1 || mountainHeight > 12) throw new Error('mountainHeight is an integer from 1 to 12.')
  if (!Array.isArray(workerTimes) || workerTimes.length < 1 || workerTimes.length > 4) throw new Error('workerTimes needs 1 to 4 workers.')
  if (workerTimes.some(v => !Number.isInteger(v) || v < 1 || v > 8)) throw new Error('Each worker time is an integer from 1 to 8.')
  return { mountainHeight, workerTimes }
}

// A worker with time t removes x layers in t * (1 + 2 + ... + x) seconds.
export function buildTrace({ mountainHeight, workerTimes }) {
  const cutsWithin = seconds => workerTimes.map(time => {
    let cut = 0
    while (((cut + 1) * (cut + 2)) / 2 * time <= seconds) cut++
    return cut
  })
  let lo = 1
  let hi = Math.min(...workerTimes) * ((mountainHeight * (mountainHeight + 1)) / 2)
  const domain = [lo, hi]
  const frames = [{ phase: 'start', activeLine: L('set low to 1'), lo, hi, mid: null, verdict: null, cuts: workerTimes.map(() => 0), message: `The mountain of height ${mountainHeight} needs between ${lo} and ${hi} seconds.` }]
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    const cuts = cutsWithin(mid)
    const total = cuts.reduce((a, b) => a + b, 0)
    const verdict = total >= mountainHeight
    frames.push({ phase: 'probe', activeLine: L('if the workers can remove the height in mid seconds'), lo, hi, mid, verdict, cuts, message: `${mid} seconds: workers remove ${total} layers, ${verdict ? 'enough' : 'not enough'} for ${mountainHeight}.` })
    if (verdict) hi = mid
    else lo = mid + 1
  }
  frames.push({ phase: 'done', activeLine: L('return low'), lo, hi: lo, mid: null, verdict: null, cuts: cutsWithin(lo), message: `Minimum time: ${lo} seconds.` })
  return { input: { mountainHeight, workerTimes }, domain, result: lo, frames }
}

export const code = `minimum seconds for the workers to bring the mountain to zero
  set low to 1 and high to the fastest worker time times the full cost of height h
  while low is less than high
    set mid to the middle value, rounded down
    if the workers can remove the height in mid seconds then
      set high to mid
    else
      set low to mid plus 1
  return low

layers one worker can remove in a time limit
  start with zero layers removed
  while removing one more layer still fits in the limit
    add one layer
  return the number of layers removed`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_number_of_seconds(mountainHeight, workerTimes):
    def removable(seconds):
        total = 0
        for time in workerTimes:
            cut = 0
            while (cut + 1) * (cut + 2) // 2 * time <= seconds:
                cut += 1
            total += cut
        return total

    low = 1
    high = min(workerTimes) * (mountainHeight * (mountainHeight + 1) // 2)
    while low < high:
        mid = (low + high) // 2
        if removable(mid) >= mountainHeight:
            high = mid
        else:
            low = mid + 1
    return low
`
