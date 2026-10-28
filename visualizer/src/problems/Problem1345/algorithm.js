export function parseInput(text) {
  const input = JSON.parse(text)
  const arr = input?.arr
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 12) throw new Error('Use {"arr": [...]} with 1 to 12 integers.')
  if (arr.some(v => !Number.isInteger(v) || v < -1000 || v > 1000)) throw new Error('Values are integers from -1000 to 1000.')
  return { arr }
}

export function buildTrace(input) {
  const { arr } = input
  const n = arr.length
  if (n === 1) {
    return { input, result: 0, frames: [{ phase: 'done', activeLine: L('if the array has one element'), current: 0, frontier: [], visited: [0], jumps: 0, message: 'One element: no jump is needed.' }] }
  }
  const byValue = new Map()
  arr.forEach((v, i) => {
    if (!byValue.has(v)) byValue.set(v, [])
    byValue.get(v).push(i)
  })
  const dist = Array(n).fill(-1)
  dist[0] = 0
  const queue = [0]
  const frames = [{ phase: 'start', activeLine: L('start a queue with index zero'), current: 0, frontier: [0], visited: [0], jumps: 0, message: 'Start at index 0.' }]
  let answer = -1
  for (let head = 0; head < queue.length; head++) {
    const i = queue[head]
    if (i === n - 1) {
      answer = dist[i]
      frames.push({ phase: 'found', activeLine: L('if this index is the last index'), current: i, frontier: queue.slice(head + 1), visited: queue.slice(0, head + 1), jumps: answer, message: `Reached the last index after ${answer} jump(s).` })
      break
    }
    const sameValue = byValue.get(arr[i]) ?? []
    const candidates = [i - 1, i + 1, ...sameValue]
    frames.push({ phase: 'pop', activeLine: L('gather neighbours'), current: i, frontier: queue.slice(head + 1), visited: [...queue.slice(0, head + 1)], jumps: dist[i], message: `At index ${i} (value ${arr[i]}), ${sameValue.length} index(es) share its value.` })
    for (const j of candidates) {
      if (j >= 0 && j < n && dist[j] === -1) {
        dist[j] = dist[i] + 1
        queue.push(j)
      }
    }
    byValue.set(arr[i], [])
  }
  if (answer === -1) frames.push({ phase: 'done', activeLine: L('return minus one if the queue empties'), current: null, frontier: [], visited: [...queue], jumps: null, message: 'The last index cannot be reached: -1.' })
  else frames.push({ phase: 'done', activeLine: L('return its distance'), current: null, frontier: [], visited: [...queue], jumps: answer, message: `Minimum jumps: ${answer}.` })
  return { input, result: answer, frames }
}

export const code = `minimum jumps from index 0 to the last index
  if the array has one element then return zero
  map each value to the list of indexes that hold it
  start a queue with index zero at distance zero and mark it reached
  repeat while the queue is not empty
    take the next index and its distance from the queue
    if this index is the last index then return its distance
    gather neighbours: index minus one, index plus one, and all indexes with the same value
    for each neighbour that is inside the array and not reached
      mark it reached and add it to the queue with distance plus one
    clear the same-value list for this value so it is not scanned again
  return minus one if the queue empties`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_jumps(arr):
    n = len(arr)
    if n == 1:
        return 0
    by_value = {}
    for i, v in enumerate(arr):
        by_value.setdefault(v, []).append(i)
    dist = [-1] * n
    dist[0] = 0
    queue = [0]
    head = 0
    while head < len(queue):
        i = queue[head]
        head += 1
        if i == n - 1:
            return dist[i]
        for j in [i - 1, i + 1] + by_value.get(arr[i], []):
            if 0 <= j < n and dist[j] == -1:
                dist[j] = dist[i] + 1
                queue.append(j)
        by_value[arr[i]] = []
    return -1
`
