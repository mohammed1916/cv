export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with the given arrangement.' },
  { id: 'expand', label: 'Expand', description: 'Take the next arrangement from the queue.' },
  { id: 'push', label: 'Push', description: 'Reach a new arrangement with one operation.' },
  { id: 'found', label: 'Found', description: 'The sorted arrangement is reached.' },
  { id: 'done', label: 'Result', description: 'Report that sorting is impossible.' },
]

export function parseInput(text) {
  const perm = JSON.parse(text)
  if (!Array.isArray(perm) || perm.length < 1 || perm.length > 8) throw new Error('Use a JSON array of 1 to 8 values.')
  const sorted = [...perm].sort((a, b) => a - b)
  if (!sorted.every((v, i) => v === i)) throw new Error('The array must hold each value from 0 to n minus 1 exactly once.')
  return { perm }
}

const keyOf = arr => arr.join(',')

export function buildTrace({ perm }) {
  const n = perm.length
  const goalKey = keyOf(Array.from({ length: n }, (_, i) => i))
  const dist = new Map([[keyOf(perm), 0]])
  const queue = [perm.slice()]
  const frames = [{ phase: 'start', activeLine: L('let goal be'), pythonLine: P('goal = tuple'), message: `Start from ${perm.join(' ')}. Operations: reverse the whole array, or rotate it left by one.`, arr: perm.slice(), depth: 0, queued: 1, seen: 1, found: false }]
  let head = 0
  while (head < queue.length) {
    const cur = queue[head++]
    const depth = dist.get(keyOf(cur))
    const isGoal = keyOf(cur) === goalKey
    frames.push({ phase: 'expand', activeLine: L('let cur be'), pythonLine: P('cur = queue.popleft'), message: `Look at ${cur.join(' ')} after ${depth} operation${depth === 1 ? '' : 's'}.`, arr: cur.slice(), depth, queued: queue.length - head, seen: dist.size, found: isGoal })
    if (isGoal) {
      frames.push({ phase: 'found', activeLine: L('if cur equals goal'), pythonLine: P('return dist[cur]'), message: `The sorted arrangement is reached in ${depth} operation${depth === 1 ? '' : 's'}.`, arr: cur.slice(), depth, queued: queue.length - head, seen: dist.size, found: true })
      return { input: { perm }, result: depth, frames }
    }
    const options = [cur.slice().reverse(), cur.slice(1).concat(cur.slice(0, 1))]
    for (const next of options) {
      const k = keyOf(next)
      if (dist.has(k)) continue
      dist.set(k, depth + 1)
      queue.push(next)
      frames.push({ phase: 'push', activeLine: L('if the neighbor is unseen'), pythonLine: P('dist[nxt] = dist[cur] + 1'), message: `New arrangement ${next.join(' ')} costs ${depth + 1}.`, arr: next.slice(), depth: depth + 1, queued: queue.length - head, seen: dist.size, found: false })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return -1'), pythonLine: P('return -1'), message: 'Every reachable arrangement was checked; sorted order is not among them.', arr: perm.slice(), depth: -1, queued: 0, seen: dist.size, found: false })
  return { input: { perm }, result: -1, frames }
}

export const code = `minimum operations to sort the permutation
  let goal be the sorted array 0 to n minus 1
  let dist[start] be 0 and queue hold start
  while the queue is not empty
    let cur be the next arrangement from the queue
    if cur equals goal then return dist[cur]
    for each neighbor from reversing or rotating cur left
      if the neighbor is unseen then record one more step and enqueue it
  return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(line => line.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `from collections import deque

def min_operations_to_sort(perm):
    n = len(perm)
    goal = tuple(range(n))
    start = tuple(perm)
    dist = {start: 0}
    queue = deque([start])
    while queue:
        cur = queue.popleft()
        if cur == goal:
            return dist[cur]
        for nxt in (tuple(reversed(cur)), cur[1:] + cur[:1]):
            if nxt not in dist:
                dist[nxt] = dist[cur] + 1
                queue.append(nxt)
    return -1`

const pyLines = python.split('\n')
const P = s => {
  const index = pyLines.findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}
