const ITERATIONS = 50

export function parseInput(text) {
  const spec = JSON.parse(text)
  const { stations, k } = spec
  if (!Array.isArray(stations) || stations.length < 2 || stations.length > 20) throw new Error('Use 2 to 20 station positions.')
  if (stations.some((x, i) => !Number.isInteger(x) || x < 0 || x > 1000 || (i > 0 && x <= stations[i - 1]))) {
    throw new Error('Positions are strictly increasing integers from 0 to 1000.')
  }
  if (!Number.isInteger(k) || k < 1 || k > 10) throw new Error('k is an integer from 1 to 10.')
  return spec
}

const gapsOf = stations => stations.slice(1).map((x, i) => x - stations[i])

// Extra stations needed so that no gap is longer than `distance`.
const needed = (gaps, distance) => gaps.reduce((total, gap) => total + Math.ceil(gap / distance) - 1, 0)

export function buildTrace(spec) {
  const gaps = gapsOf(spec.stations)
  let lo = 0, hi = Math.max(...gaps)
  const frames = [{ phase: 'start', activeLine: L('lo = 0, hi'), lo, hi, mid: null, feasible: null, iteration: 0, message: `The answer lies between 0 and the largest gap, ${hi}.` }]
  for (let iteration = 1; iteration <= ITERATIONS; iteration++) {
    const mid = (lo + hi) / 2
    const count = needed(gaps, mid)
    const ok = count <= spec.k
    if (ok) hi = mid
    else lo = mid
    frames.push({
      phase: 'check', activeLine: L(ok ? 'hi = mid' : 'lo = mid'), lo, hi, mid, feasible: ok, iteration,
      message: ok
        ? `A largest gap of ${mid.toFixed(4)} needs ${count} station(s), within ${spec.k}: try smaller.`
        : `A largest gap of ${mid.toFixed(4)} needs ${count} station(s), more than ${spec.k}: try larger.`,
    })
  }
  return { input: spec, gaps, result: hi, frames }
}

export const code = `function minmaxGasDist(stations, k):
  gaps = distance between each pair of neighbouring stations
  lo = 0, hi = largest gap
  repeat 50 times:
    mid = (lo + hi) / 2
    needed = sum over gaps of (ceil(gap / mid) - 1)
    if needed is at most k then hi = mid
    otherwise lo = mid
  return hi`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `import math

def minmax_gas_dist(stations, k):
    gaps = [b - a for a, b in zip(stations, stations[1:])]
    lo, hi = 0, max(gaps)
    for _ in range(50):
        mid = (lo + hi) / 2
        needed = sum(math.ceil(g / mid) - 1 for g in gaps)
        if needed <= k:
            hi = mid
        else:
            lo = mid
    return hi`
