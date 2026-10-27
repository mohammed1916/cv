const MAX_MEMORY = 5
const MAX_OPERATIONS = 16
const MAX_ID = 9
const MAX_TIME = 50

const ARITY = { addPacket: 3, forwardPacket: 0, getCount: 3 }

export function parseInput(text) {
  const data = JSON.parse(text)
  const memory = data?.memory_limit
  const operations = data?.operations
  if (!Number.isInteger(memory) || memory < 1 || memory > MAX_MEMORY) throw new Error(`memory_limit must be an integer from 1 to ${MAX_MEMORY}.`)
  if (!Array.isArray(operations) || operations.length < 1 || operations.length > MAX_OPERATIONS) throw new Error(`operations must list 1 to ${MAX_OPERATIONS} calls.`)
  let lastTime = -1
  for (const op of operations) {
    if (!Array.isArray(op) || !Object.hasOwn(ARITY, op[0])) throw new Error('Each operation is ["addPacket", source, destination, timestamp], ["forwardPacket"] or ["getCount", destination, startTime, endTime].')
    const args = op.slice(1)
    if (args.length !== ARITY[op[0]]) throw new Error(`${op[0]} takes ${ARITY[op[0]]} argument(s).`)
    if (!args.every(Number.isInteger)) throw new Error('Arguments are integers.')
    if (op[0] === 'addPacket') {
      const [source, destination, timestamp] = args
      if (source < 0 || source > MAX_ID || destination < 0 || destination > MAX_ID) throw new Error(`Source and destination run from 0 to ${MAX_ID}.`)
      if (timestamp < 0 || timestamp > MAX_TIME) throw new Error(`Timestamps run from 0 to ${MAX_TIME}.`)
      if (timestamp < lastTime) throw new Error('addPacket timestamps must not decrease.')
      lastTime = timestamp
    }
    if (op[0] === 'getCount') {
      const [destination, start, end] = args
      if (destination < 0 || destination > MAX_ID) throw new Error(`Destination runs from 0 to ${MAX_ID}.`)
      if (start > end) throw new Error('getCount needs startTime <= endTime.')
    }
  }
  return { memory_limit: memory, operations }
}

export const code = `run router(memory_limit, operations):
  set queue to an empty first-in first-out list of packets, and keys to an empty set
  for each operation in order:
    if it is addPacket(source, destination, timestamp):
      if the packet is already in keys then return false
      if the queue is full then remove the oldest packet from the queue and from keys
      add the packet to the back of the queue and to keys, and return true
    if it is forwardPacket:
      if the queue is empty then return an empty list
      remove the oldest packet from the queue and from keys, and return it
    if it is getCount(destination, startTime, endTime):
      return how many packets in the queue have that destination and a timestamp from startTime to endTime`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ memory_limit, operations }) {
  const queue = []
  const keys = new Set()
  const ops = []
  const frames = [{ phase: 'start', activeLine: L('set queue to an empty'), op: -1, queue: [], message: `Router with memory for ${memory_limit} packet(s).` }]
  operations.forEach((op, index) => {
    const [name, ...args] = op
    let returned
    let phase
    let line
    let message
    if (name === 'addPacket') {
      const [source, destination, timestamp] = args
      const key = `${source},${destination},${timestamp}`
      phase = 'add'
      line = L('if the packet is already in keys')
      if (keys.has(key)) {
        returned = false
        message = `Packet ${key} is already stored: rejected.`
      } else {
        line = L('if the queue is full')
        let evicted = null
        if (queue.length === memory_limit) {
          evicted = queue.shift()
          keys.delete(evicted.key)
        }
        queue.push({ key, source, destination, timestamp })
        keys.add(key)
        returned = true
        message = evicted ? `Memory full: removed the oldest packet ${evicted.key}, then stored ${key}.` : `Stored packet ${key}.`
      }
    } else if (name === 'forwardPacket') {
      phase = 'forward'
      line = L('if the queue is empty')
      if (queue.length === 0) {
        returned = []
        message = 'No packet to forward.'
      } else {
        const packet = queue.shift()
        keys.delete(packet.key)
        returned = [packet.source, packet.destination, packet.timestamp]
        message = `Forwarded the oldest packet ${packet.key}.`
      }
    } else {
      const [destination, start, end] = args
      phase = 'count'
      line = L('return how many packets')
      returned = queue.filter(p => p.destination === destination && p.timestamp >= start && p.timestamp <= end).length
      message = `${returned} stored packet(s) for destination ${destination} with timestamps ${start} to ${end}.`
    }
    ops.push({ name, args, returned })
    frames.push({ phase, activeLine: line, op: index, queue: queue.map(p => p.key), message })
  })
  frames.push({ phase: 'done', activeLine: L('return how many packets'), op: operations.length - 1, queue: queue.map(p => p.key), message: 'Every operation is complete.' })
  const result = ops.map(o => o.returned)
  return { input: { memory_limit, operations }, memory_limit, operations, ops, result, frames }
}

export const python = `def run_router(memory_limit, operations):
    queue = []
    keys = set()
    results = []
    for op in operations:
        name = op[0]
        if name == 'addPacket':
            key = (op[1], op[2], op[3])
            if key in keys:
                results.append(False)
                continue
            if len(queue) == memory_limit:
                oldest = queue.pop(0)
                keys.discard(oldest)
            queue.append(key)
            keys.add(key)
            results.append(True)
        elif name == 'forwardPacket':
            if not queue:
                results.append([])
            else:
                key = queue.pop(0)
                keys.discard(key)
                results.append(list(key))
        else:
            destination, start, end = op[1], op[2], op[3]
            results.append(sum(1 for s, d, t in queue if d == destination and start <= t <= end))
    return results
`
