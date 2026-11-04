const MAX_LENGTH = 16

export const python = `import bisect

def min_time(s, order, k):
    stars = [-1, len(s)]
    valid = 0
    for t, i in enumerate(order):
        slot = bisect.bisect_left(stars, i)
        left, right = stars[slot - 1], stars[slot]
        gain = (i - left) * (right - i)
        valid += gain
        stars.insert(slot, i)
        if valid >= k:
            return t
    return -1`

const pseudo = `place walls just outside both ends of s
valid substrings so far = 0
for each time t, take i = order[t]
  find the nearest star or wall on each side of i
  new substrings = (i - left) times (right - i)
  add them to valid
  record i as a star
  if valid reaches k, return t
no time reached k: return -1`
const pseudoLines = pseudo.split('\n')
export const code = pseudoLines.map((text, index) => ({ line: index + 1, text }))

const lineIn = (lines, text) => {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing code line: ${text}`)
  return index + 1
}
const pyLines = python.split('\n')
const L = text => lineIn(pseudoLines, text)
const P = text => lineIn(pyLines, text)

export const phases = [
  { id: 'start', label: 'Start', description: 'No stars yet, so no substring is valid.' },
  { id: 'pick', label: 'Pick', description: 'order[t] says which index turns into a star.' },
  { id: 'bounds', label: 'Bounds', description: 'Find the star-free gap around the new star.' },
  { id: 'gain', label: 'Count', description: 'Every start and end choice in the gap gives one newly valid substring.' },
  { id: 'star', label: 'Star', description: 'The new star splits the gap in two.' },
  { id: 'test', label: 'Test', description: 'Compare the running count with k.' },
  { id: 'done', label: 'Result', description: 'Report the time, or -1.' },
]
export const inputLabel = 'Object with s, order (a permutation of its indices) and k'
export const complexity = `O(n log n) comparisons and O(n) space. Inserting into a Python list also shifts later entries, which is O(n) per insert in theory but cheap in practice; a balanced sorted set gives a strict O(n log n). The rules allow s up to 100,000 characters; the visualization caps it at ${MAX_LENGTH}.`
export const url = 'https://leetcode.com/problems/minimum-time-to-activate-string/'
export const examples = [
  { label: 'Active midway', input: '{"s":"bridge","order":[3,0,5,1,4,2],"k":18}' },
  { label: 'First star is enough', input: '{"s":"kite","order":[1,3,0,2],"k":6}' },
  { label: 'Never active', input: '{"s":"moon","order":[2,0,3,1],"k":11}' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s, order and k.')
  const { s, order, k } = input
  if (typeof s !== 'string' || !/^[a-z]+$/.test(s)) throw new Error('s must contain lowercase English letters and not be empty.')
  if (s.length > MAX_LENGTH) throw new Error(`This visualization shows s up to ${MAX_LENGTH} characters.`)
  if (!Array.isArray(order) || order.length !== s.length) throw new Error('order must have one entry per character of s.')
  const seen = new Set()
  for (const value of order) {
    if (!Number.isInteger(value) || value < 0 || value >= s.length || seen.has(value)) throw new Error('order must be a permutation of the indices of s.')
    seen.add(value)
  }
  if (!Number.isInteger(k) || k < 1 || k > 1e9) throw new Error('k must be a whole number from 1 to 1,000,000,000.')
  return { s, order, k }
}

const lowerBound = (sorted, value) => {
  let low = 0
  let high = sorted.length
  while (low < high) {
    const middle = (low + high) >> 1
    if (sorted[middle] < value) low = middle + 1
    else high = middle
  }
  return low
}

export function buildTrace({ s, order, k }) {
  const n = s.length
  const stars = [-1, n]
  const history = []
  const frames = []
  let valid = 0
  const push = (phase, pseudoText, pyText, message, extra = {}) => frames.push({
    phase, activeLine: L(pseudoText), pythonLine: P(pyText), message,
    t: -1, i: -1, left: null, right: null, gain: null, valid,
    stars: stars.slice(1, -1), history: history.map(row => ({ ...row })), ...extra,
  })
  push('start', 'place walls', 'stars = [-1', `Walls sit at -1 and ${n}, just outside the string, so every gap has two ends.`)
  push('start', 'valid substrings so far', 'valid = 0', `With no star no substring is valid, so valid starts at 0. The target is ${k}.`)

  for (let t = 0; t < n; t++) {
    const i = order[t]
    push('pick', 'for each time', 'for t, i in enumerate', `At time ${t}, index ${i} ('${s[i]}') becomes a star.`, { t, i })
    const slot = lowerBound(stars, i)
    const left = stars[slot - 1]
    const right = stars[slot]
    const here = { t, i, left, right }
    push('bounds', 'find the nearest', 'left, right = stars', `Looking outward from ${i}, the nearest boundaries are ${left === -1 ? 'the left wall at -1' : `the star at ${left}`} and ${right === n ? `the right wall at ${n}` : `the star at ${right}`}.`, here)
    const gain = (i - left) * (right - i)
    Object.assign(here, { gain })
    push('gain', 'new substrings =', 'gain = (i - left)', `A newly valid substring must include ${i} and stay inside the gap: ${i - left} possible starts × ${right - i} possible ends = ${gain}.`, here)
    valid += gain
    history.push({ t, 'order[t]': i, left, right, gain, valid })
    push('gain', 'add them to valid', 'valid += gain', `valid rises by ${gain} to ${valid}.`, here)
    stars.splice(slot, 0, i)
    push('star', 'record i', 'stars.insert(slot, i)', `Index ${i} is now a star, so later gaps stop here.`, here)
    if (valid >= k) {
      push('test', 'if valid reaches k', 'if valid >= k', `${valid} ≥ ${k}, so the string is active.`, here)
      push('done', 'if valid reaches k', 'return t', `Return ${t}: time ${t} is the first with at least ${k} valid substrings.`, here)
      return { input: { s, order, k }, result: t, frames }
    }
    push('test', 'if valid reaches k', 'if valid >= k', `${valid} < ${k}, so keep going.`, here)
  }
  push('done', 'no time reached', 'return -1', `All ${n} characters are stars and there are only ${valid} substrings in total, fewer than ${k}. Return -1.`)
  return { input: { s, order, k }, result: -1, frames }
}
