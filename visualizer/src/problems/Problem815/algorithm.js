export function parseInput(text) {
  const d = JSON.parse(text)
  const bad = () => new Error('Enter JSON {"routes": [[1,2,7],...], "source": 1, "target": 6}: 1-8 routes of 1-8 distinct stops, stop ids integers in [0, 99], source and target integers in [0, 99] (visualization caps).')
  if (!d || typeof d !== 'object' || !Array.isArray(d.routes)) throw bad()
  const isStop = v => Number.isInteger(v) && v >= 0 && v <= 99
  if (d.routes.length < 1 || d.routes.length > 8 || !isStop(d.source) || !isStop(d.target)) throw bad()
  if (!d.routes.every(r => Array.isArray(r) && r.length >= 1 && r.length <= 8 && r.every(isStop) && new Set(r).size === r.length)) throw bad()
  return { routes: d.routes.map(r => [...r]), source: d.source, target: d.target }
}
export function buildTrace({ routes, source, target }) {
  const frames = []
  let queue = [], seenStops = [], seenBuses = [], current = null
  const push = (phase, activeLine, message, extra = {}) => frames.push({ phase, activeLine, message, queue: queue.map(q => [...q]), seenStops: [...seenStops], seenBuses: [...seenBuses], current, bus: -1, ...extra })
  push('start', L('if source equals target'), source === target ? 'Source equals target: zero buses needed.' : `Treat each bus as one hop: BFS over stops from ${source}; the BFS depth is the number of buses taken.`)
  if (source === target) {
    push('done', L('return 0'), 'Answer: 0.')
    return { input: { routes, source, target }, result: 0, frames }
  }
  const stops = new Map()
  routes.forEach((route, i) => route.forEach(s => { if (!stops.has(s)) stops.set(s, []); stops.get(s).push(i) }))
  push('index', L('set stops[s]'), `Index stops to the buses serving them: ${[...stops.entries()].map(([s, b]) => `${s}: [${b.join(',')}]`).join('; ')}.`)
  queue = [[source, 0]]; seenStops = [source]
  push('seed', L('set queue to'), `Start at stop ${source} having taken 0 buses.`)
  let result = -1
  outer: while (queue.length) {
    const [stop, buses] = queue.shift()
    current = stop
    push('pop', L('remove the front pair'), `Pop stop ${stop} (reached with ${buses} bus${buses === 1 ? '' : 'es'}). Try every bus serving it.`)
    for (const b of stops.get(stop) || []) {
      if (seenBuses.includes(b)) {
        push('skip', L('if b is in seen_buses'), `Bus ${b} was already boarded earlier (reaching its stops sooner or equally fast), so skip it.`, { bus: b })
        continue
      }
      seenBuses.push(b)
      const added = []
      for (const nxt of routes[b]) {
        if (nxt === target) {
          result = buses + 1
          push('found', L('if nxt equals target'), `Bus ${b} passes through target ${target}: ${buses + 1} bus${buses + 1 === 1 ? '' : 'es'}. BFS guarantees this is minimal.`, { bus: b })
          break outer
        }
        if (!seenStops.includes(nxt)) { seenStops.push(nxt); queue.push([nxt, buses + 1]); added.push(nxt) }
      }
      push('board', L('add b to seen_buses'), `Board bus ${b} [${routes[b].join(', ')}]: ${added.length ? `new stops ${added.join(', ')} are reachable with ${buses + 1} buses` : 'it reaches no new stops'}.`, { bus: b })
    }
  }
  current = null
  push('done', result === -1 ? L('return -1') : L('return buses + 1'), result === -1 ? 'The queue emptied without touching the target: return -1.' : `Answer: ${result}.`)
  return { input: { routes, source, target }, result, frames }
}
export const code = `if source equals target, return 0
set stops[s] to the list of bus indices i whose route contains stop s
set queue to [(source, 0)], seen_stops to {source}, and seen_buses to an empty set
while queue is not empty
  remove the front pair (stop, buses) from queue
  for each bus b in stops[stop]
    if b is in seen_buses, skip to the next bus
    add b to seen_buses
    for each next stop nxt in routes[b]
      if nxt equals target, return buses + 1
      if nxt is not in seen_stops, add nxt to seen_stops and append (nxt, buses + 1) to queue
return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def num_buses_to_destination(routes, source, target):
    if source == target:
        return 0
    stops = {}
    for i, route in enumerate(routes):
        for s in route:
            stops.setdefault(s, []).append(i)
    queue = [(source, 0)]
    seen_stops, seen_buses = {source}, set()
    while queue:
        stop, buses = queue.pop(0)
        for b in stops.get(stop, []):
            if b in seen_buses:
                continue
            seen_buses.add(b)
            for nxt in routes[b]:
                if nxt == target:
                    return buses + 1
                if nxt not in seen_stops:
                    seen_stops.add(nxt)
                    queue.append((nxt, buses + 1))
    return -1
`
