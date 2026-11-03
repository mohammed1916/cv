export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a values list.')
  const { values } = input
  if (!Array.isArray(values) || values.length < 1 || values.length > 40) throw new Error('values has 1 to 40 entries.')
  if (!values.every(v => Number.isInteger(v) && v >= -20 && v <= 20)) throw new Error('Each value is an integer from -20 to 20.')
  for (let i = 1; i < values.length; i++) {
    if (values[i] < values[i - 1]) throw new Error('values must be sorted in nondecreasing order.')
  }
  return { values }
}

// The hidden array is reachable only through size() and at(index). The trace records every at() call.
export function buildTrace({ values }) {
  const n = values.length
  const revealed = new Map()
  const probe = index => {
    if (!Number.isInteger(index) || index < 0 || index >= n) throw new Error(`at(${index}) is outside the array`)
    revealed.set(index, values[index])
    return values[index]
  }
  const bigArray = { size: () => n, at: probe }
  const frames = []
  let blocks = 0
  let start = 0
  const snapshot = () => [...revealed].map(([index, value]) => ({ index, value }))
  const push = (phase, pythonLine, text, state, message) =>
    frames.push({ phase, pythonLine, activeLine: L(text), blocks, start, revealed: snapshot(), ...state, message })

  push('start', 2, 'blocks is zero and start is zero', { lo: null, hi: null, mid: null, value: null }, `The array has ${n} hidden entries; start at index 0.`)
  while (start < n) {
    const value = bigArray.at(start)
    push('read', 6, 'value is at(start)', { lo: null, hi: null, mid: null, value }, `The block starting at ${start} has value ${value}.`)
    let lo = start + 1
    let hi = n
    push('search', 7, 'binary search for the first index', { lo, hi, mid: null, value }, `Search ${lo} to ${hi} for the first value above ${value}.`)
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2)
      const midValue = bigArray.at(mid)
      if (midValue > value) {
        hi = mid
        push('probe', 10, 'if at(mid) is above', { lo, hi, mid, value }, `at(${mid}) = ${midValue} is above ${value}, so the boundary is at ${mid} or earlier.`)
      } else {
        lo = mid + 1
        push('probe', 13, 'otherwise move the search range', { lo, hi, mid, value }, `at(${mid}) = ${midValue} is not above ${value}, so the boundary is after ${mid}.`)
      }
    }
    blocks += 1
    start = lo
    push('block', 15, 'blocks increases by one', { lo, hi, mid: null, value }, `Block ${blocks} ends before index ${lo === n ? 'the end' : lo}.`)
  }
  push('done', 16, 'return blocks', { lo: null, hi: null, mid: null, value: null }, `The array has ${blocks} blocks of equal values.`)
  return { input: { values }, result: blocks, frames, probes: revealed.size, calls: frames.length }
}

export const code = `number of blocks of equal values in a hidden sorted array
  blocks is zero and start is zero
  while start is inside the array
    value is at(start)
    binary search for the first index after start with a larger value
      mid is the middle of the search range
      if at(mid) is above value then search the left half
      otherwise move the search range past mid
    blocks increases by one and start moves to the boundary
  return blocks`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def count_blocks(big_array):
    n = big_array.size()
    blocks = 0
    start = 0
    while start < n:
        value = big_array.at(start)
        lo, hi = start + 1, n
        while lo < hi:
            mid = (lo + hi) // 2
            if big_array.at(mid) > value:
                hi = mid
            else:
                lo = mid + 1
        blocks += 1
        start = lo
    return blocks
`
