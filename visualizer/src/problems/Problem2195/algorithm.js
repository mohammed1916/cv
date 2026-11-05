// LeetCode 2195: Append K Integers With Minimal Sum.
// The cheapest new integers are the smallest positive values not already in nums. Walk the sorted distinct values
// and fill each gap between them, from the left, until k integers are placed.

const MAX_LEN = 10
const MAX_VALUE = 30
const MAX_K = 10

export function parseInput(text) {
  let spec
  try { spec = JSON.parse(text) } catch { throw new Error('Use JSON like {"nums":[5,6,8],"k":2}.') }
  if (!spec || !Array.isArray(spec.nums) || !Number.isInteger(spec.k)) throw new Error('Give a nums array and an integer k.')
  if (spec.nums.length < 1 || spec.nums.length > MAX_LEN) throw new Error(`Use 1 to ${MAX_LEN} values. The visualization caps the length there.`)
  if (!spec.nums.every(v => Number.isInteger(v) && v >= 1 && v <= MAX_VALUE)) throw new Error(`Each value is an integer from 1 to ${MAX_VALUE}.`)
  if (spec.k < 1 || spec.k > MAX_K) throw new Error(`k is an integer from 1 to ${MAX_K}.`)
  return { nums: spec.nums, k: spec.k }
}

export const code = `FUNCTION minimalKSum(nums, k)
    distinct ← sorted unique values of nums
    last ← 0
    remaining ← k
    total ← 0
    FOR each value v in distinct
        IF v > last + 1 AND remaining > 0 THEN
            take ← min(v - last - 1, remaining)
            total ← total + sum of last+1 .. last+take
            remaining ← remaining - take
        last ← v
    IF remaining > 0 THEN
        total ← total + sum of last+1 .. last+remaining
    RETURN total`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def minimal_k_sum(nums, k):
    last = 0
    remaining = k
    total = 0
    for v in sorted(set(nums)):
        if v > last + 1 and remaining > 0:
            take = min(v - last - 1, remaining)
            total += (last + 1 + last + take) * take // 2
            remaining -= take
        last = v
    if remaining > 0:
        total += (last + 1 + last + remaining) * remaining // 2
    return total
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Taken', description: 'Sort the distinct values; they cannot be appended again.' },
  { id: 'gap', label: 'Fill gaps', description: 'Fill the free integers in each gap, from the left.' },
  { id: 'tail', label: 'Tail', description: 'Any integers still needed come after the largest value.' },
  { id: 'done', label: 'Result', description: 'The minimal sum of the k appended integers.' },
]

export function buildTrace({ nums, k }) {
  const distinct = [...new Set(nums)].sort((a, b) => a - b)
  let last = 0
  let remaining = k
  let total = 0
  const picked = []
  const frames = []
  const push = (phase, index, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, index, activeLine, pythonLine, message, nums, k, distinct, last, remaining, total, picked: picked.slice(), ...extra,
  })
  push('start', -1, L('distinct ← sorted'), P('sorted(set(nums))'), `Taken values: ${distinct.join(', ')}. We need ${k} new integers.`)
  for (const v of distinct) {
    if (v > last + 1 && remaining > 0) {
      const take = Math.min(v - last - 1, remaining)
      for (let x = last + 1; x <= last + take; x++) { picked.push(x); total += x }
      remaining -= take
      push('gap', v, L('take ← min'), P('take = min'), `The gap before ${v} holds ${last + 1}..${v - 1}. Take ${take}. Still needed: ${remaining}.`, { take, last: v })
    }
    last = v
  }
  if (remaining > 0) {
    for (let x = last + 1; x <= last + remaining; x++) { picked.push(x); total += x }
    push('tail', -1, L('IF remaining > 0 THEN'), P('if remaining > 0'), `After ${last}, take ${last + 1}..${last + remaining}.`, { remaining: 0 })
    remaining = 0
  }
  push('done', -1, L('RETURN total'), P('return total'), `The appended integers are ${picked.join(', ')}; their sum is ${total}.`, { picked: picked.slice(), total })
  return { input: { nums, k }, result: total, frames }
}
