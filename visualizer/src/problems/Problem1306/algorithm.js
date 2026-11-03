export const phases = [
  { id: 'start', label: 'Start index', description: 'Begin at the start index and mark it as seen. Its value says how far a jump can reach.' },
  { id: 'pop', label: 'Take next index', description: 'Take the earliest index still waiting in the queue.' },
  { id: 'zero', label: 'Zero found', description: 'This index holds zero, so a jump can end here. The answer is true.' },
  { id: 'jump', label: 'Try jump', description: 'Consider landing at the index reached by jumping forward or backward by its value.' },
  { id: 'skip', label: 'Skip landing', description: 'The landing is off the array or was already seen, so it adds nothing new.' },
  { id: 'enqueue', label: 'Queue landing', description: 'Mark the new landing as seen and queue it for later exploration.' },
  { id: 'done', label: 'Complete', description: 'Every reachable index was explored without finding zero, or a zero was found.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"arr": [4, 2, 3, 0, 3, 1, 2], "start": 5}.')
  const { arr, start } = input
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 20 || !arr.every(v => Number.isInteger(v) && v >= 0 && v <= 20)) throw new Error('arr is a list of 1 to 20 integers from 0 to 20.')
  if (!Number.isInteger(start) || start < 0 || start >= arr.length) throw new Error(`start is an index from 0 to ${arr.length - 1}.`)
  return { arr, start }
}

export function buildTrace({ arr, start }) {
  const n = arr.length
  const frames = []
  const seen = new Set([start])
  const queue = [start]
  let current = null
  let candidate = null
  let result = false
  const snap = () => ({ arr: [...arr], queue: [...queue], seen: [...seen].sort((a, b) => a - b), current, candidate, start })
  const frame = (phase, line, message, pyLine = line) => frames.push({ phase, activeLine: L(line), pythonLine: P(pyLine), snapshot: snap(), message })

  frame('start', 'queue = [start]', `Start at index ${start} with value ${arr[start]}.`, 'queue = deque')
  search: while (queue.length > 0) {
    current = queue.shift()
    frame('pop', 'i = queue.pop_front()', `Visit index ${current} with value ${arr[current]}.`, 'queue.popleft()')
    if (arr[current] === 0) {
      result = true
      frame('zero', 'arr[i] == 0', `Index ${current} holds zero, so a sequence of jumps reaches a zero.`, 'arr[i] == 0')
      break search
    }
    for (const next of [current + arr[current], current - arr[current]]) {
      candidate = next
      frame('jump', 'for next in', `From ${current}, a jump of ${arr[current]} lands at ${next}.`, 'for nxt in')
      if (next < 0 || next >= n || seen.has(next)) {
        frame('skip', 'if 0 <= next', next < 0 || next >= n ? `Index ${next} is off the array.` : `Index ${next} was already seen.`, 'if 0 <= nxt')
        continue
      }
      seen.add(next)
      queue.push(next)
      frame('enqueue', 'seen.add(next)', `Index ${next} is new, so mark it seen and queue it.`, 'seen.add(nxt)')
    }
  }
  candidate = null
  current = null
  frame('done', result ? 'return true' : 'return false', result ? 'A zero is reachable, so the answer is true.' : 'Every reachable index was explored, and none holds zero. The answer is false.', result ? 'return True' : 'return False')
  return { input: { arr: [...arr], start }, result, frames }
}

export const code = `can reach zero (arr, start):
  queue = [start]; seen = {start}
  while queue is not empty:
    i = queue.pop_front()
    if arr[i] == 0: return true
    for next in (i + arr[i], i - arr[i]):
      if 0 <= next < n and next not in seen:
        seen.add(next); queue.append(next)
  return false`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def can_reach(arr, start):
    n = len(arr)
    queue = deque([start])
    seen = {start}
    while queue:
        i = queue.popleft()
        if arr[i] == 0:
            return True
        for nxt in (i + arr[i], i - arr[i]):
            if 0 <= nxt < n and nxt not in seen:
                seen.add(nxt)
                queue.append(nxt)
    return False`

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
