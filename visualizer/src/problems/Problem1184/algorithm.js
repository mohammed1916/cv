export const phases = [
  { id: 'start', label: 'Order stops', description: 'Sort the two stop indices so the forward gap runs from the lower to the higher stop.' },
  { id: 'circle', label: 'Loop total', description: 'Add every edge once to get the length of the full loop.' },
  { id: 'forward', label: 'Forward gap', description: 'Add the edges between the lower and higher stop.' },
  { id: 'compare', label: 'Other side', description: 'The remaining edges form the other route: loop total minus the forward gap.' },
  { id: 'done', label: 'Shorter side', description: 'Return the smaller of the two routes.' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  const { distance, start, destination } = data ?? {}
  if (!Array.isArray(distance) || distance.length < 1 || distance.length > 60) throw new Error('distance must be an array of 1 to 60 edge lengths.')
  if (distance.some(v => !Number.isInteger(v) || v < 0 || v > 10000)) throw new Error('Each edge length must be an integer from 0 to 10000.')
  for (const [name, stop] of [['start', start], ['destination', destination]]) {
    if (!Number.isInteger(stop) || stop < 0 || stop >= distance.length) throw new Error(`${name} must be a stop index from 0 to ${distance.length - 1}.`)
  }
  return { distance, start, destination }
}

export function buildTrace(input) {
  const { distance, start, destination } = input
  const lo = Math.min(start, destination)
  const hi = Math.max(start, destination)
  const frames = []
  let total = 0
  let forward = 0
  const snap = extra => ({ distance, lo, hi, total, forward, ...extra })

  frames.push({ phase: 'start', activeLine: 2, pythonLine: 2, message: `Stops ${start} and ${destination} are ordered as ${lo} and ${hi}. Edges ${lo} to ${hi - 1} form the forward gap.`, snapshot: snap({ edge: -1 }) })
  for (let i = 0; i < distance.length; i++) {
    total += distance[i]
    frames.push({ phase: 'circle', activeLine: 6, pythonLine: 6, message: `Edge ${i} has length ${distance[i]}. The loop total grows to ${total}.`, snapshot: snap({ edge: i }) })
  }
  for (let i = lo; i < hi; i++) {
    forward += distance[i]
    frames.push({ phase: 'forward', activeLine: 8, pythonLine: 8, message: `Edge ${i} lies on the forward gap. The forward length is now ${forward}.`, snapshot: snap({ edge: i }) })
  }
  const other = total - forward
  frames.push({ phase: 'compare', activeLine: 9, pythonLine: 9, message: `The other side is ${total} minus ${forward}, which is ${other}.`, snapshot: snap({ edge: -1, other }) })
  const result = Math.min(forward, other)
  frames.push({ phase: 'done', activeLine: 10, pythonLine: 10, message: `The shorter side has length ${result}.`, snapshot: snap({ edge: -1, other, result }) })
  return { input, result, frames }
}

export const code = `function shortestBusRoute(distance, start, destination) {
  const lo = Math.min(start, destination)
  const hi = Math.max(start, destination)
  let total = 0
  let forward = 0
  for (const length of distance) total += length
  for (let i = lo; i < hi; i++) forward += distance[i]
  const other = total - forward
  return Math.min(forward, other)
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def shortest_bus_route(distance, start, destination):
    lo = min(start, destination)
    hi = max(start, destination)
    total, forward = 0, 0
    for length in distance:
        total += length
    for i in range(lo, hi):
        forward += distance[i]
    other = total - forward
    return min(forward, other)`

export const pythonLineMap = Object.fromEntries(code.map((_, i) => [i + 1, i + 1]))
