export const phases = [
  { id: 'start', label: 'Start', description: 'Every remainder class starts empty. There are k classes, numbered 0 to k - 1.' },
  { id: 'count', label: 'Count remainders', description: 'Put each value into the class of its remainder modulo k.' },
  { id: 'check', label: 'Match partner classes', description: 'Class r must be matched with class (k - r) mod k, because those two sums are multiples of k.' },
  { id: 'done', label: 'Complete', description: 'Report whether every class can be paired off.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"arr": [2, 4, 1, 5], "k": 6}.')
  const { arr, k } = input
  if (!Array.isArray(arr) || arr.length < 2 || arr.length > 12 || arr.length % 2 !== 0 || !arr.every(v => Number.isInteger(v) && Math.abs(v) <= 1000)) throw new Error('arr is an even-length list of 2 to 12 integers from -1000 to 1000.')
  if (!Number.isInteger(k) || k < 1 || k > 10) throw new Error('k is an integer from 1 to 10.')
  return { arr, k }
}

export function buildTrace({ arr, k }) {
  const count = Array(k).fill(0)
  const mod = v => ((v % k) + k) % k
  const snap = (index, remainder, partner, ok) => ({ counts: [...count], index, remainder, partner, ok })
  const frames = [{
    phase: 'start', activeLine: L('const count = Array(k).fill(0)'), pythonLine: P('count = [0]'), snapshot: snap(null, null, null, null),
    message: `Make ${k} remainder classes, all empty. Each value joins the class of its remainder modulo ${k}.`,
  }]
  arr.forEach((value, i) => {
    const r = mod(value)
    count[r] += 1
    frames.push({
      phase: 'count', activeLine: L('count[((v % k) + k) % k] += 1'), pythonLine: P('count[value % k]'), snapshot: snap(i, r, null, null),
      message: `Value ${value} has remainder ${r}, so class ${r} now holds ${count[r]}.`,
    })
  })
  let result = true
  for (let r = 0; r < k; r++) {
    const s = (k - r) % k
    let matched
    if (r === s) {
      matched = count[r] % 2 === 0
      frames.push({
        phase: 'check', activeLine: L('if (r === s) {'), pythonLine: P('if r == s'), snapshot: snap(null, r, s, matched),
        message: `Class ${r} partners with itself, since ${r} + ${r} is 0 mod ${k}. It holds ${count[r]} value${count[r] === 1 ? '' : 's'}, which ${matched ? 'splits into pairs' : 'leaves one value without a partner'}.`,
      })
    } else {
      matched = count[r] === count[s]
      frames.push({
        phase: 'check', activeLine: L('} else if (count[r] !== count[s])'), pythonLine: P('elif count[r] != count[s]'), snapshot: snap(null, r, s, matched),
        message: `Class ${r} (${count[r]} values) must match class ${s} (${count[s]} values). ${matched ? 'The counts agree.' : 'The counts differ, so some value has no partner.'}`,
      })
    }
    if (!matched) { result = false; break }
  }
  frames.push({
    phase: 'done', activeLine: L(result ? 'return true' : 'return false'), pythonLine: P(result ? 'return True' : 'return False'), snapshot: snap(null, null, null, result),
    message: result ? 'Every class can be paired off, so the values split into pairs whose sums are divisible by k.' : 'A class cannot be paired off, so no split into such pairs exists.',
  })
  return { input: { arr, k }, result, frames }
}

export const code = [
  "function canPairUp(arr, k) {",
  "  const count = Array(k).fill(0)",
  "  for (const v of arr) {",
  "    count[((v % k) + k) % k] += 1 }",
  "  for (let r = 0; r < k; r++) {",
  "    const s = (k - r) % k",
  "    if (r === s) {",
  "      if (count[r] % 2 === 1) return false",
  "    } else if (count[r] !== count[s]) return false",
  "  } return true }",
].map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def can_pair_up(arr, k):
    count = [0] * k
    for value in arr:
        count[value % k] += 1
    for r in range(k):
        s = (k - r) % k
        if r == s:
            if count[r] % 2:
                return False
        elif count[r] != count[s]:
            return False
    return True
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
