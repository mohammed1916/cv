// Teaching model derived from general breadth-first search knowledge; not verified against the official statement.
const MAX_LENGTH = 6

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums1 and nums2.')
  const { nums1, nums2 } = input
  if (!Array.isArray(nums1) || !Array.isArray(nums2) || nums1.length !== nums2.length) throw new Error('nums1 and nums2 must have the same length.')
  if (nums1.length < 2 || nums1.length > MAX_LENGTH) throw new Error(`Length is from 2 to ${MAX_LENGTH} in this visual.`)
  if (![...nums1, ...nums2].every(Number.isInteger)) throw new Error('Every value is an integer.')
  const sorted1 = [...nums1].sort((a, b) => a - b).join(',')
  const sorted2 = [...nums2].sort((a, b) => a - b).join(',')
  if (sorted1 !== sorted2) throw new Error('nums2 must be a permutation of nums1.')
  return { nums1, nums2 }
}

export function buildTrace({ nums1, nums2 }) {
  const goal = nums2.join(',')
  const start = nums1.slice()
  const frames = []
  const seen = new Set([start.join(',')])
  const queue = [{ cur: start, depth: 0 }]
  let answer = start.join(',') === goal ? 0 : -1
  if (answer === 0) {
    frames.push({ pythonLine: 6, phase: 'found', activeLine: L('if the start equals the goal'), array: start, target: nums2, depth: 0, ok: true, message: 'The arrays already match: 0 operations.' })
  }
  let head = 0
  while (answer === -1 && head < queue.length) {
    const { cur, depth } = queue[head++]
    frames.push({ pythonLine: 10, phase: 'visit', activeLine: L('take the next state'), array: cur, target: nums2, depth, ok: null, message: `Dequeue a state reached in ${depth} operation${depth === 1 ? '' : 's'}.` })
    const n = cur.length
    search: for (let l = 0; l < n; l++) {
      for (let r = l; r < n; r++) {
        const rest = [...cur.slice(0, l), ...cur.slice(r + 1)]
        const block = cur.slice(l, r + 1)
        for (let pos = 0; pos <= rest.length; pos++) {
          const next = [...rest.slice(0, pos), ...block, ...rest.slice(pos)]
          const key = next.join(',')
          if (key === goal) {
            answer = depth + 1
            frames.push({ pythonLine: 19, phase: 'found', activeLine: L('return the depth plus one'), array: next, target: nums2, depth: depth + 1, ok: true, message: `Reached the target after ${depth + 1} operation${depth === 0 ? '' : 's'}.` })
            break search
          }
          if (!seen.has(key)) {
            seen.add(key)
            queue.push({ cur: next, depth: depth + 1 })
          }
        }
      }
    }
  }
  if (answer === -1) {
    frames.push({ pythonLine: 23, phase: 'done', activeLine: L('return negative one'), array: start, target: nums2, depth: 0, ok: false, message: 'The target is unreachable.' })
  } else {
    frames.push({ pythonLine: 19, phase: 'done', activeLine: L('return the depth plus one'), array: nums2, target: nums2, depth: answer, ok: true, message: `Minimum operations: ${answer}.` })
  }
  return { input: { nums1, nums2 }, result: answer, frames }
}

export const code = `minimum split-and-merge operations from nums1 to nums2
  if the start equals the goal then return 0
  queue the start state at depth 0 and mark it seen
  while the queue is not empty
    take the next state and its depth
    for each subarray [l..r] of the state
      remove it and reinsert it at each position
      if the result equals the goal then return the depth plus one
      if the result is new then mark it seen and queue it
  return negative one when the goal is never reached`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import deque

def min_operations(nums1, nums2):
    start, goal = tuple(nums1), tuple(nums2)
    if start == goal:
        return 0
    queue = deque([(start, 0)])
    seen = {start}
    while queue:
        cur, depth = queue.popleft()
        n = len(cur)
        for l in range(n):
            for r in range(l, n):
                rest = cur[:l] + cur[r + 1:]
                block = cur[l:r + 1]
                for pos in range(len(rest) + 1):
                    nxt = rest[:pos] + block + rest[pos:]
                    if nxt == goal:
                        return depth + 1
                    if nxt not in seen:
                        seen.add(nxt)
                        queue.append((nxt, depth + 1))
    return -1
`
