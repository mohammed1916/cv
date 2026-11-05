export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s and k.')
  const { s, k } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 30 || !/^[01]+$/.test(s)) throw new Error('s is 1 to 30 binary digits (the visualization caps the length at 30).')
  if (!Number.isInteger(k) || k < 1 || k > s.length) throw new Error('k is an integer from 1 to the length of s.')
  return { s, k }
}

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

export function buildTrace({ s, k }) {
  const n = s.length
  const z0 = [...s].filter(ch => ch === '0').length
  const dist = new Map([[z0, 0]])
  const queue = [z0]
  const frames = []
  let result = z0 === 0 ? 0 : -1
  frames.push({ pythonLine: P('z = s.count'), phase: 'start', activeLine: L('count the zeros'), zeros: z0, depth: 0, message: `${plural(z0, 'zero')} must become ones.` })
  for (let head = 0; result === -1 && head < queue.length; head++) {
    const c = queue[head]
    frames.push({ pythonLine: P('c = queue.popleft'), phase: 'visit', activeLine: L('take the next'), zeros: c, depth: dist.get(c), message: `Explore ${plural(c, 'zero')} at depth ${dist.get(c)}.` })
    const lo = Math.max(0, k - (n - c))
    const hi = Math.min(c, k)
    for (let x = lo; x <= hi && result === -1; x++) {
      const next = c + k - 2 * x
      if (dist.has(next)) continue
      dist.set(next, dist.get(c) + 1)
      frames.push({ pythonLine: P('nxt = c'), phase: 'next', activeLine: L('the new zero count'), zeros: next, depth: dist.get(next), message: `Flipping ${plural(x, 'zero')} among the k chosen gives ${plural(next, 'zero')}.` })
      if (next === 0) result = dist.get(next)
      else queue.push(next)
    }
  }
  const pythonLine = z0 === 0 ? P('return 0') : P(result === -1 ? 'return -1' : 'return dist')
  frames.push({ pythonLine, phase: 'done', activeLine: L(result === -1 ? 'return -1' : 'the new zero count'), zeros: result === -1 ? null : 0, depth: result === -1 ? null : result, message: result === -1 ? 'No sequence of flips reaches zero zeros.' : `Minimum of ${plural(result, 'operation')}.` })
  return { input: { s, k }, result, frames }
}

export const code = `function minOperations(s, k) {
  const n = s.length
  const z = [...s].filter(ch => ch === '0').length // count the zeros
  if (z === 0) return 0
  const dist = new Map([[z, 0]])
  const queue = [z]
  for (let head = 0; head < queue.length; head++) {
    const c = queue[head] // take the next zero count c from the queue
    const lo = Math.max(0, k - (n - c))
    const hi = Math.min(c, k)
    for (let x = lo; x <= hi; x++) {
      const next = c + k - 2 * x // the new zero count
      if (dist.has(next)) continue
      dist.set(next, dist.get(c) + 1)
      if (next === 0) return dist.get(next)
      queue.push(next)
    }
  }
  return -1 // return -1 if the queue runs out
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import deque

def min_operations(s, k):
    n = len(s)
    z = s.count('0')
    if z == 0:
        return 0
    dist = {z: 0}
    queue = deque([z])
    while queue:
        c = queue.popleft()
        lo = max(0, k - (n - c))
        hi = min(c, k)
        for x in range(lo, hi + 1):
            nxt = c + k - 2 * x
            if nxt not in dist:
                dist[nxt] = dist[c] + 1
                if nxt == 0:
                    return dist[nxt]
                queue.append(nxt)
    return -1
`
const P = s => python.split('\n').findIndex(line => line.includes(s)) + 1
