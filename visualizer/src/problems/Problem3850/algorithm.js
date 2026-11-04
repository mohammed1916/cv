export const code = `function countSequencesToK(nums, k) {
  // states starts with value 1 counted once, stored as reduced fractions
  let states = new Map([['1/1', { p: 1, q: 1, count: 1 }]])
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))
  const add = (next, p, q, count) => {
    const g = gcd(p, q)
    const key = String(p / g) + '/' + String(q / g)
    const current = next.get(key)
    next.set(key, { p: p / g, q: q / g, count: (current ? current.count : 0) + count })
  }
  for (const x of nums) {
    // for each number x in order, every state moves to three possible values
    const next = new Map()
    for (const { p, q, count } of states.values()) {
      // every state keeps its value when x is skipped
      add(next, p, q, count)
      // every state also multiplies and divides by x
      add(next, p * x, q, count)
      add(next, p, q * x, count)
    }
    states = next
  }
  // return the count stored at k
  const answer = states.get(String(k) + '/1')
  return answer ? answer.count : 0
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = key => code.findIndex(c => c.text.includes(key)) + 1
const PY = key => python.split('\n').findIndex(line => line.includes(key)) + 1

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 8 || !nums.every(v => Number.isInteger(v) && v >= 1 && v <= 6)) throw new Error('nums has 1 to 8 integers from 1 to 6.')
  if (!Number.isInteger(k) || k < 1 || k > 100000) throw new Error('k is an integer from 1 to 100000.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  let states = new Map([['1/1', { p: 1, q: 1, count: 1 }]])
  const frames = []
  const table = () => [...states.values()].map(({ p, q, count }) => ({ value: q === 1 ? `${p}` : `${p}/${q}`, count }))
  frames.push({ table: table(), x: null, phase: 'setup', pythonLine: PY('states = {'), activeLine: L('states starts'), message: 'Only the value 1 is reachable, in one way.' })
  nums.forEach((x, index) => {
    const next = new Map()
    const add = (p, q, count) => {
      const g = gcd(p, q)
      const a = p / g
      const b = q / g
      const key = `${a}/${b}`
      const current = next.get(key)
      next.set(key, { p: a, q: b, count: (current ? current.count : 0) + count })
    }
    for (const { p, q, count } of states.values()) {
      add(p, q, count)
      add(p * x, q, count)
      add(p, q * x, count)
    }
    states = next
    frames.push({ table: table(), x, index, phase: 'element', pythonLine: PY('for np, nq'), activeLine: L('every state also'), message: `After element ${index} (${x}) there are ${states.size} distinct values.` })
  })
  const answer = states.get(`${k}/1`)?.count ?? 0
  frames.push({ table: table(), x: null, phase: 'done', pythonLine: PY('return states.get'), activeLine: L('return the count'), message: `Ways to reach ${k}: ${answer}.` })
  return { input: { nums, k }, result: answer, frames }
}

export const python = `from math import gcd

def count_sequences_to_k(nums, k):
    states = {(1, 1): 1}
    for x in nums:
        nxt = {}
        for (p, q), count in states.items():
            for np, nq in ((p, q), (p * x, q), (p, q * x)):
                g = gcd(np, nq)
                key = (np // g, nq // g)
                nxt[key] = nxt.get(key, 0) + count
        states = nxt
    return states.get((k, 1), 0)`
