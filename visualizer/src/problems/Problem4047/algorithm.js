const PHASES = [
  { id: 'start', label: 'Start', description: 'Begin with the sorted array at depth zero.' },
  { id: 'expand', label: 'Expand', description: 'Try every legal replacement from this array.' },
  { id: 'found', label: 'Found', description: 'The XOR of the array is zero; this depth is the answer.' },
  { id: 'done', label: 'Result', description: 'Report the minimum number of operations, or -1.' },
]

export const phases = PHASES

export const code = `function minOpsXorZero(nums) {
  const start = [...nums].sort((a, b) => a - b)
  const dist = new Map([[start.join(','), 0]])
  const queue = [start]
  for (let head = 0; head < queue.length; head++) {
    const state = queue[head]
    const depth = dist.get(state.join(','))
    let total = 0
    for (const v of state) total ^= v
    if (total === 0) return depth
    for (let i = 0; i < state.length; i++) {
      for (let j = 0; j < state.length; j++) {
        if (i === j || state[i] === state[j]) continue
        const next = [...state]
        next[i] = state[i] ^ state[j]
        next.sort((a, b) => a - b)
        const key = next.join(',')
        if (!dist.has(key)) {
          dist.set(key, depth + 1)
          queue.push(next)
        }
      }
    }
  }
  return -1
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

function L(fragment) {
  const index = code.findIndex(c => c.text.includes(fragment))
  if (index < 0) throw new Error(`Missing pseudocode line: ${fragment}`)
  return index + 1
}

export const python = `from collections import deque

def min_ops_xor_zero(nums):
    start = tuple(sorted(nums))
    dist = {start: 0}
    queue = deque([start])
    while queue:
        state = queue.popleft()
        total = 0
        for v in state:
            total ^= v
        if total == 0:
            return dist[state]
        for i in range(len(state)):
            for j in range(len(state)):
                if i == j or state[i] == state[j]:
                    continue
                nxt = list(state)
                nxt[i] = state[i] ^ state[j]
                key = tuple(sorted(nxt))
                if key not in dist:
                    dist[key] = dist[state] + 1
                    queue.append(key)
    return -1
`

const PY = python.split('\n')

function P(fragment) {
  const index = PY.findIndex(line => line.includes(fragment))
  if (index < 0) throw new Error(`Missing Python line: ${fragment}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 4) throw new Error('nums has 1 to 4 values.')
  if (!nums.every(v => Number.isInteger(v) && v >= 0 && v <= 7)) throw new Error('Each value is an integer from 0 to 7.')
  return { nums }
}

const xorAll = arr => arr.reduce((acc, v) => acc ^ v, 0)

export function buildTrace({ nums }) {
  const start = [...nums].sort((a, b) => a - b)
  const key = arr => arr.join(',')
  const dist = new Map([[key(start), 0]])
  const queue = [start]
  const frames = []
  frames.push({ pythonLine: P('start = tuple'), phase: 'start', activeLine: L('const start = [...nums]'), state: start, depth: 0, total: xorAll(start), message: `Start from [${start.join(', ')}], XOR ${xorAll(start)}.` })
  for (let head = 0; head < queue.length; head++) {
    const state = queue[head]
    const depth = dist.get(key(state))
    const total = xorAll(state)
    frames.push({ pythonLine: P('state = queue.popleft'), phase: 'expand', activeLine: L('const state = queue[head]'), state, depth, total, message: `Depth ${depth}: [${state.join(', ')}] has XOR ${total}.` })
    if (total === 0) {
      frames.push({ pythonLine: P('return dist[state]'), phase: 'found', activeLine: L('if (total === 0) return depth'), state, depth, total, message: `XOR is zero at depth ${depth}.` })
      frames.push({ pythonLine: P('return dist[state]'), phase: 'done', activeLine: L('if (total === 0) return depth'), state, depth, total, message: `Minimum operations: ${depth}.` })
      return { input: { nums }, result: depth, frames }
    }
    for (let i = 0; i < state.length; i++) {
      for (let j = 0; j < state.length; j++) {
        if (i === j || state[i] === state[j]) continue
        const next = [...state]
        next[i] = state[i] ^ state[j]
        next.sort((a, b) => a - b)
        const k = key(next)
        if (!dist.has(k)) {
          dist.set(k, depth + 1)
          queue.push(next)
          frames.push({ pythonLine: P('dist[key] = dist[state] + 1'), phase: 'expand', activeLine: L('if (!dist.has(key))'), state, depth, total, from: { i, j }, next, message: `Replace ${state[i]} at ${i} with ${state[i]} xor ${state[j]} = ${next.join(', ')} at depth ${depth + 1}.` })
        }
      }
    }
  }
  frames.push({ pythonLine: P('return -1'), phase: 'done', activeLine: L('return -1'), state: null, depth: -1, total: null, message: 'No sequence of operations reaches XOR zero.' })
  return { input: { nums }, result: -1, frames }
}
