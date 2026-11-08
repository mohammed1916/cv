export const phases = [
  { id: 'start', label: 'Start', description: 'Put the start index in the queue and mark it as seen.' },
  { id: 'pop', label: 'Visit index', description: 'Take the next index from the queue and look at its value.' },
  { id: 'found', label: 'Zero found', description: 'The value at this index is 0, so it can be reached.' },
  { id: 'push', label: 'Queue jumps', description: 'Try the two landing spots i + arr[i] and i - arr[i] that stay inside the array.' },
  { id: 'skip', label: 'Already seen', description: 'This landing spot was already queued, so it is skipped.' },
  { id: 'done', label: 'Complete', description: 'Report whether a zero was reached.' },
]

export const examples = [
  { label: 'Chain of jumps', input: '{"arr":[2,3,1,0,4],"start":1}' },
  { label: 'Blocked early', input: '{"arr":[1,1,3,0,2],"start":0}' },
  { label: 'Short path', input: '{"arr":[4,0,1,3,0],"start":2}' },
    { label: "Single element", input: "{\"arr\":[0],\"start\":0}" },
    { label: "Repeated target value", input: "{\"arr\":[2,2,2],\"start\":1}" },
    { label: "Chain of 30 ending in a self loop", input: "{\"arr\":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,29],\"start\":0}" },
    { label: "Long run: 30 random links", input: "{\"arr\":[17,11,25,23,13,20,12,23,13,26,21,7,17,8,3,6,10,17,19,3,11,15,15,4,9,10,25,28,19,20],\"start\":21}" },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.arr) || !Number.isInteger(data.start)) throw new Error('Use an object with an array arr and an integer start, such as {"arr":[4,2,0],"start":0}.')
  if (data.arr.length < 1 || data.arr.length > 30) throw new Error('arr must have 1 to 30 values in this visualization.')
  if (data.start < 0 || data.start >= data.arr.length) throw new Error('start is an index inside arr.')
  if (!data.arr.every(v => Number.isInteger(v) && v >= 0 && v < data.arr.length)) throw new Error('arr is a list of integers from 0 to arr.length - 1.')
  return { arr: data.arr, start: data.start }
}

export function buildTrace({ arr, start }) {
  const n = arr.length
  const seen = new Set([start])
  const queue = [start]
  const snap = (current, extra = {}) => ({ arr, current, queue: [...queue], seen: [...seen], ...extra })
  const frames = [{ phase: 'start', activeLine: L('const queue = [start]'), pythonLine: P('queue = deque'), snapshot: snap(null),
    message: `Start at index ${start}, whose value is ${arr[start]}. Jumps may go left or right by that value.` }]
  let result = false
  while (queue.length > 0) {
    const i = queue.shift()
    frames.push({ phase: 'pop', activeLine: L('const i = queue.shift()'), pythonLine: P('i = queue.popleft()'), snapshot: snap(i),
      message: `Visit index ${i} (value ${arr[i]}).` })
    if (arr[i] === 0) {
      frames.push({ phase: 'found', activeLine: L('if (arr[i] === 0)'), pythonLine: P('if arr[i] == 0'), snapshot: snap(i, { found: true }),
        message: `Index ${i} holds 0, so a zero is reachable.` })
      result = true
      break
    }
    for (const next of [i + arr[i], i - arr[i]]) {
      if (next < 0 || next >= n) {
        frames.push({ phase: 'skip', activeLine: L('if (next >= 0'), pythonLine: P('if 0 <= next_index'), snapshot: snap(i, { outside: next }),
          message: `Jump to ${next} would leave the array, so ignore it.` })
        continue
      }
      if (seen.has(next)) {
        frames.push({ phase: 'skip', activeLine: L('!seen.has(next)'), pythonLine: P('next_index not in seen'), snapshot: snap(i, { target: next }),
          message: `Index ${next} is already queued or visited, so skip it.` })
        continue
      }
      seen.add(next)
      queue.push(next)
      frames.push({ phase: 'push', activeLine: L('queue.push(next)'), pythonLine: P('queue.append(next_index)'), snapshot: snap(i, { target: next }),
        message: `Jump from ${i} to ${next}; queue it for a later visit.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return false'), pythonLine: P('return False'), snapshot: snap(null, { result }),
    message: `Return ${result}.`, result })
  return { input: { arr, start }, result, frames }
}

export const code = `function canReach(arr, start) {
  const queue = [start]
  const seen = new Set([start])
  while (queue.length > 0) {
    const i = queue.shift()
    if (arr[i] === 0) return true
    for (const next of [i + arr[i], i - arr[i]]) {
      if (next >= 0 && next < arr.length && !seen.has(next)) {
        seen.add(next)
        queue.push(next)
      }
    }
  }
  return false
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import deque

def can_reach(arr, start):
    n = len(arr)
    queue = deque([start])
    seen = {start}
    while queue:
        i = queue.popleft()
        if arr[i] == 0:
            return True
        for next_index in (i + arr[i], i - arr[i]):
            if 0 <= next_index < n and next_index not in seen:
                seen.add(next_index)
                queue.append(next_index)
    return False
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
