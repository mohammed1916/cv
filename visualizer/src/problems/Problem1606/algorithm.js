export function parseInput(text) {
  const data = JSON.parse(text)
  const { k, arrival, load } = data ?? {}
  if (!Number.isInteger(k) || k < 1 || k > 6) throw new Error('"k" is an integer from 1 to 6 in this visualization.')
  if (!Array.isArray(arrival) || !Array.isArray(load) || arrival.length !== load.length) throw new Error('"arrival" and "load" need one value per request.')
  if (arrival.length < 1 || arrival.length > 12) throw new Error('Use 1 to 12 requests.')
  if (arrival.some((t, i) => !Number.isInteger(t) || t < 1 || t > 60 || (i > 0 && t <= arrival[i - 1]))) throw new Error('Arrival times are integers from 1 to 60 and strictly increasing.')
  if (load.some(x => !Number.isInteger(x) || x < 1 || x > 20)) throw new Error('Each load is an integer from 1 to 20.')
  return { k, arrival, load }
}

export function buildTrace({ k, arrival, load }) {
  const handled = Array(k).fill(0)
  const free = Array.from({ length: k }, (_, i) => i)
  const busy = []
  const frames = [{ phase: 'start', activeLine: L('set every server'), request: -1, server: -1, handled: [...handled], message: `${k} servers, all free.` }]
  arrival.forEach((t, i) => {
    for (let j = busy.length - 1; j >= 0; j--) {
      if (busy[j].end <= t) { free.push(busy[j].server); busy.splice(j, 1) }
    }
    free.sort((a, b) => a - b)
    if (free.length === 0) {
      frames.push({ phase: 'drop', activeLine: L('drop the request'), request: i, server: -1, handled: [...handled], message: `Request ${i} at time ${t} finds every server busy and is dropped.` })
      return
    }
    let pos = free.findIndex(s => s >= i % k)
    if (pos === -1) pos = 0
    const server = free.splice(pos, 1)[0]
    handled[server]++
    busy.push({ end: t + load[i], server })
    frames.push({ phase: 'assign', activeLine: L('take the free server'), request: i, server, handled: [...handled], message: `Request ${i} goes to server ${server}, busy until ${t + load[i]}.` })
  })
  const best = Math.max(...handled)
  const result = handled.map((_, s) => s).filter(s => handled[s] === best)
  frames.push({ phase: 'done', activeLine: L('return every server with the highest'), request: -1, server: -1, handled: [...handled], message: `Busiest servers: [${result.join(', ')}].` })
  return { input: { k, arrival, load }, result, frames }
}

export const code = `servers that handled the most requests, given k servers, arrival times, and loads
  set every server handled count to 0
  keep a free list of all servers and a busy list that starts empty
  for each request i with arrival time t
    move every server whose request ended by t back into the free list
    if no server is free then drop the request and continue
    take the free server with the lowest id at least i mod k, or the lowest free id if none
    add 1 to that server handled count and mark it busy until t plus load i
  return every server with the highest handled count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `import bisect
import heapq

def busiest_servers(k, arrival, load):
    handled = [0] * k
    free = list(range(k))
    busy = []
    for i, (t, dur) in enumerate(zip(arrival, load)):
        while busy and busy[0][0] <= t:
            _, s = heapq.heappop(busy)
            bisect.insort(free, s)
        if not free:
            continue
        pos = bisect.bisect_left(free, i % k)
        if pos == len(free):
            pos = 0
        s = free.pop(pos)
        handled[s] += 1
        heapq.heappush(busy, (t + dur, s))
    best = max(handled)
    return [s for s in range(k) if handled[s] == best]
`
