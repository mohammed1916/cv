export const code = `function openLock(deadends, target):
  dead = set of deadends
  if "0000" is dead then return -1
  queue = new queue holding ("0000", 0)
  seen = {"0000"}
  while the queue is not empty:
    take the oldest (node, steps) from the front of queue
    if node equals target then return steps
    for each of the 4 wheels and each direction (+1, -1):
      nxt = node with that wheel turned one step
      if nxt is not seen and not dead:
        mark nxt as seen
        append (nxt, steps + 1) to the back of queue
  return -1 because the queue ran out`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import deque

def open_lock(deadends, target):
    dead = set(deadends)
    if "0000" in dead:
        return -1
    queue = deque([("0000", 0)])
    seen = {"0000"}
    while queue:
        node, steps = queue.popleft()
        if node == target:
            return steps
        for i in range(4):
            for d in (1, -1):
                nxt = node[:i] + str((int(node[i]) + d) % 10) + node[i + 1:]
                if nxt not in seen and nxt not in dead:
                    seen.add(nxt)
                    queue.append((nxt, steps + 1))
    return -1`

export function parseInput(text) {
  const v = JSON.parse(text)
  if (!v || !Array.isArray(v.deadends) || typeof v.target !== 'string') throw new Error('Enter JSON like {"deadends": ["0201"], "target": "0202"}.')
  const ok = s => typeof s === 'string' && /^[0-9]{4}$/.test(s)
  if (v.deadends.length > 500 || !v.deadends.every(ok) || !ok(v.target)) throw new Error('Deadends (at most 500 for the visualization) and target must be 4-digit strings.')
  if (v.deadends.includes(v.target)) throw new Error('The target must not be a dead end.')
  return { deadends: [...new Set(v.deadends)], target: v.target }
}

export function buildTrace({ deadends, target }) {
  const dead = new Set(deadends)
  const frames = [{ phase: 'start', activeLine: L('dead ='), node: '0000', steps: 0, queueSize: 0, seen: 0, fresh: [], blocked: [], path: [], message: `Each state is a 4-digit string; one move turns one wheel up or down (wrapping 9<->0). ${dead.size} dead end${dead.size === 1 ? '' : 's'} are forbidden.` }]
  if (dead.has('0000')) {
    frames.push({ phase: 'done', activeLine: L('"0000" is dead'), node: '0000', steps: -1, queueSize: 0, seen: 0, fresh: [], blocked: [], path: [], message: 'The start state 0000 is a dead end: the lock is stuck immediately, answer -1.' })
    return { input: { deadends, target }, result: -1, frames }
  }
  const parent = new Map([['0000', null]])
  const dist = new Map([['0000', 0]])
  let queue = ['0000'], head = 0
  const pathTo = s => { const p = []; for (let c = s; c !== null; c = parent.get(c)) p.push(c); return p.reverse() }
  while (head < queue.length) {
    const node = queue[head++]
    const steps = dist.get(node)
    frames.push({ phase: 'pop', activeLine: L('take the oldest'), node, steps, queueSize: queue.length - head, seen: parent.size, fresh: [], blocked: [], path: [], message: `Dequeue ${node} (${steps} move${steps === 1 ? '' : 's'}). BFS pops states in order of distance, so the first time the target is popped is the shortest.` })
    if (node === target) {
      frames.push({ phase: 'done', activeLine: L('return steps'), node, steps, queueSize: queue.length - head, seen: parent.size, fresh: [], blocked: [], path: pathTo(node), message: `Reached ${target} after ${steps} moves.` })
      return { input: { deadends, target }, result: steps, frames }
    }
    const fresh = [], blocked = []
    for (let i = 0; i < 4; i++) for (const d of [1, -1]) {
      const nxt = node.slice(0, i) + ((+node[i] + d + 10) % 10) + node.slice(i + 1)
      if (dead.has(nxt)) blocked.push(nxt)
      else if (!parent.has(nxt)) { parent.set(nxt, node); dist.set(nxt, steps + 1); queue.push(nxt); fresh.push(nxt) }
    }
    frames.push({ phase: 'expand', activeLine: L('mark nxt as seen'), node, steps, queueSize: queue.length - head, seen: parent.size, fresh, blocked, path: [], message: `Eight neighbours of ${node}: ${fresh.length} new (queued), ${blocked.length} dead end${blocked.length === 1 ? '' : 's'} (skipped), the rest already seen.` })
  }
  frames.push({ phase: 'done', activeLine: L('ran out'), node: '', steps: -1, queueSize: 0, seen: parent.size, fresh: [], blocked: [], path: [], message: `The queue is empty after reaching ${parent.size} states: the target is walled off by dead ends. Answer -1.` })
  return { input: { deadends, target }, result: -1, frames }
}
