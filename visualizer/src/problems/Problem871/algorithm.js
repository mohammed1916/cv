export function parseInput(text) {
  const v = JSON.parse(text)
  if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error('Enter {"target": n, "startFuel": n, "stations": [[position, fuel], ...]}.')
  const { target, startFuel, stations } = v
  if (!Number.isInteger(target) || target < 1 || target > 1000000000) throw new Error('target must be an integer from 1 to 1,000,000,000.')
  if (!Number.isInteger(startFuel) || startFuel < 0 || startFuel > 1000000000) throw new Error('startFuel must be an integer from 0 to 1,000,000,000.')
  if (!Array.isArray(stations) || stations.length > 25) throw new Error('stations must be an array of at most 25 [position, fuel] pairs (visualization cap).')
  let prev = 0
  for (const s of stations) {
    if (!Array.isArray(s) || s.length !== 2 || !Number.isInteger(s[0]) || !Number.isInteger(s[1])) throw new Error('Each station must be [position, fuel] with integers.')
    if (s[0] <= prev || s[0] >= target) throw new Error('Station positions must be strictly increasing and between 0 and target (exclusive).')
    if (s[1] < 1 || s[1] > 1000000000) throw new Error('Station fuel must be an integer from 1 to 1,000,000,000.')
    prev = s[0]
  }
  return { target, startFuel, stations }
}

export function buildTrace({ target, startFuel, stations }) {
  const points = [...stations, [target, 0]]
  const heap = []
  let fuel = startFuel, stops = 0, prev = 0
  const frames = []
  const f = (phase, activeLine, message, extra = {}) => frames.push({ phase, activeLine, message, index: -1, heap: heap.slice(), fuel, stops, prev, ...extra })
  f('start', 3, `Start with ${startFuel} fuel at position 0. Stations are only "used" later, when we actually run dry.`)
  for (let i = 0; i < points.length; i++) {
    const [pos, gas] = points[i]
    fuel -= pos - prev
    f('drive', 5, `Drive from ${prev} to ${pos} (${pos - prev} units): fuel is now ${fuel}${fuel < 0 ? ', which is negative, so we must have refuelled earlier' : ''}.`, { index: i })
    while (heap.length && fuel < 0) {
      const g = heap.shift()
      fuel += g; stops++
      f('refuel', 7, `Retroactively refuel at the best passed station (${g} fuel). Stops: ${stops}, fuel: ${fuel}.`, { index: i })
    }
    if (fuel < 0) {
      f('done', 10, `Even using every passed station we cannot reach ${pos}: return -1.`, { index: i })
      return { input: { target, startFuel, stations }, points, result: -1, frames }
    }
    if (i < stations.length) {
      heap.push(gas); heap.sort((x, y) => y - x)
      f('push', 11, `Reached station at ${pos}: remember its ${gas} fuel in the max-heap without stopping yet.`, { index: i })
    }
    prev = pos
  }
  f('done', 13, `Reached the target ${target} with ${stops} refuelling stop(s).`, { index: points.length - 1 })
  return { input: { target, startFuel, stations }, points, result: stops, frames }
}

export const code = `def minRefuelStops(target, startFuel, stations):
    heap = []
    fuel, stops, prev = startFuel, 0, 0
    for pos, gas in stations + [[target, 0]]:
        fuel -= pos - prev
        while heap and fuel < 0:
            fuel += -heappop(heap)
            stops += 1
        if fuel < 0:
            return -1
        heappush(heap, -gas)
        prev = pos
    return stops`.split('\n').map((text, index) => ({ line: index + 1, text }))
