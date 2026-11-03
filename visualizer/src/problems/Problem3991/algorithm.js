const MAX_N = 6

function lookup(lines, text) {
  const index = lines.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and pre.')
  const { nums, pre } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_N) throw new Error(`nums has 1 to ${MAX_N} entries.`)
  const sorted = [...nums].sort((a, b) => a - b)
  if (sorted.some((v, i) => v !== i)) throw new Error('nums must be a permutation of 0 to n minus 1.')
  if (!Array.isArray(pre) || pre.length < 1) throw new Error('pre lists at least one prefix length.')
  const unique = new Set(pre)
  if (unique.size !== pre.length || pre.some(len => !Number.isInteger(len) || len < 1 || len > nums.length)) {
    throw new Error('Each pre entry is a distinct length from 1 to n.')
  }
  return { nums, pre }
}

export function buildTrace({ nums, pre }) {
  const L = text => lookup(code, text)
  const P = text => lookup(pyLines, text)
  const n = nums.length
  const target = Array.from({ length: n }, (_, i) => i)
  const key = a => a.join(',')
  const frames = []
  const dist = new Map([[key(nums), 0]])
  const queue = [nums]
  const sameAsTarget = key(nums) === key(target)
  frames.push({ pythonLine: P('dist = {start'), phase: 'start', activeLine: L('dist[nums] = 0'), cur: nums, nxt: null, length: null, depth: 0, seen: dist.size, queued: queue.length, message: sameAsTarget ? 'The array is already sorted.' : `Start a breadth-first search from ${nums.join(' ')}.` })
  let result = sameAsTarget ? 0 : -1
  if (!sameAsTarget) {
    search: while (queue.length) {
      const cur = queue.shift()
      frames.push({ pythonLine: P('cur = queue.popleft()'), phase: 'pop', activeLine: L('cur = pop front'), cur, nxt: null, length: null, depth: dist.get(key(cur)), seen: dist.size, queued: queue.length, message: `Expand ${cur.join(' ')} at depth ${dist.get(key(cur))}.` })
      for (const length of pre) {
        const nxt = [...cur.slice(0, length).reverse(), ...cur.slice(length)]
        const seenBefore = dist.has(key(nxt))
        if (!seenBefore) {
          dist.set(key(nxt), dist.get(key(cur)) + 1)
          if (key(nxt) === key(target)) {
            frames.push({ pythonLine: P('if nxt == target'), phase: 'found', activeLine: L('if nxt equals target'), cur, nxt, length, depth: dist.get(key(nxt)), seen: dist.size, queued: queue.length, message: `Reversing the first ${length} gives the sorted array in ${dist.get(key(nxt))} moves.` })
            result = dist.get(key(nxt))
            break search
          }
          queue.push(nxt)
          frames.push({ pythonLine: P('queue.append'), phase: 'new', activeLine: L('push nxt onto queue'), cur, nxt, length, depth: dist.get(key(nxt)), seen: dist.size, queued: queue.length, message: `Reverse ${length}: ${nxt.join(' ')} is new at depth ${dist.get(key(nxt))}.` })
        } else {
          frames.push({ pythonLine: P('if nxt not in dist'), phase: 'seen', activeLine: L('if nxt is not in dist'), cur, nxt, length, depth: dist.get(key(nxt)), seen: dist.size, queued: queue.length, message: `Reverse ${length}: ${nxt.join(' ')} was already reached.` })
        }
      }
    }
  }
  frames.push({ pythonLine: P('return -1'), phase: 'done', activeLine: L('return -1'), cur: null, nxt: null, length: null, depth: result, seen: dist.size, queued: 0, message: result >= 0 ? `Sorted in ${result} moves.` : 'The sorted array cannot be reached.' })
  return { input: { nums, pre }, result, frames }
}

export const code = `fewest prefix reversals to sort
  target = 0, 1, ..., n minus 1
  if nums equals target then return 0
  dist[nums] = 0 and queue = [nums]
  while queue is not empty
    cur = pop front of queue
    for each length in pre
      nxt = reverse the first length items of cur
      if nxt is not in dist
        dist[nxt] = dist[cur] + 1
        if nxt equals target then return dist[nxt]
        push nxt onto queue
  return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `from collections import deque

def min_prefix_reversals(nums, pre):
    n = len(nums)
    target = tuple(range(n))
    start = tuple(nums)
    if start == target:
        return 0
    dist = {start: 0}
    queue = deque([start])
    while queue:
        cur = queue.popleft()
        for length in pre:
            nxt = tuple(cur[:length][::-1]) + cur[length:]
            if nxt not in dist:
                dist[nxt] = dist[cur] + 1
                if nxt == target:
                    return dist[nxt]
                queue.append(nxt)
    return -1
`

const pyLines = python.split('\n').map((text, index) => ({ line: index + 1, text }))
