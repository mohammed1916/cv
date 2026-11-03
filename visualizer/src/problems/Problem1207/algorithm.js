// Independently authored frequency-set walkthrough. The arrays are our own sample data.
const MAX_VALUES = 40

export const code = [
  { line: 1, text: 'count how many times each value occurs' },
  { line: 2, text: 'seen = empty set of occurrence counts' },
  { line: 3, text: 'for each distinct value v with count c:' },
  { line: 4, text: '  if c is already in seen: return false' },
  { line: 5, text: '  add c to seen' },
  { line: 6, text: 'return true' },
]

export const python = `from collections import Counter

def unique_occurrences(arr):
    counts = Counter(arr)
    seen = set()
    for c in counts.values():
        if c in seen:
            return False
        seen.add(c)
    return True`

export const pythonLineMap = { 1: 4, 2: 5, 3: 6, 4: 7, 5: 9, 6: 10 }

export const phases = [
  { id: 'start', label: 'Count', description: 'Count each value. Each read updates one tally.' },
  { id: 'inspect', label: 'Check count', description: 'Ask whether this occurrence count was already claimed by another value.' },
  { id: 'update', label: 'Claim count', description: 'Record the occurrence count as used by this value.' },
  { id: 'done', label: 'Result', description: 'Return whether every distinct value has its own count.' },
]

export const inputLabel = 'Object with an arr array of integers (JSON)'
export const complexity = 'O(n) expected time with a hash map of counts and a set of seen counts. The visualization accepts up to 40 numbers.'
export const examples = [
  { label: 'Unique occurrence counts', input: '{"arr":[1,2,2,1,1,3]}' },
  { label: 'Two values share a count', input: '{"arr":[1,2]}' },
  { label: 'One distinct value', input: '{"arr":[5]}' },
  { label: 'Negative and zero values', input: '{"arr":[0,0,-1,-1,-1,2]}' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.arr)) throw new Error('Use an object with an arr array, such as {"arr":[1,1,2]}.')
  const { arr } = input
  if (arr.length < 1 || arr.length > MAX_VALUES) throw new Error(`arr needs 1 to ${MAX_VALUES} values.`)
  if (!arr.every(v => Number.isInteger(v) && v >= -1000 && v <= 1000)) throw new Error('Each value must be an integer from -1000 to 1000.')
  return { arr: [...arr] }
}

export function buildTrace({ arr }) {
  const frames = []
  const counts = new Map()
  const owner = new Map()
  const snap = (extra = {}) => ({
    counts: [...counts].map(([value, count]) => ({ value, count })),
    claimed: [...owner].map(([count, value]) => ({ count, value })),
    ...extra,
  })
  frames.push({ phase: 'start', activeLine: 1, message: `Count occurrences in ${arr.length} numbers.`, snapshot: snap() })
  for (const v of arr) {
    counts.set(v, (counts.get(v) ?? 0) + 1)
    frames.push({ phase: 'start', activeLine: 1, message: `Read ${v}: it now occurs ${counts.get(v)} time(s).`, snapshot: snap({ value: v }) })
  }
  let result = true
  for (const [value, count] of counts) {
    if (owner.has(count)) {
      frames.push({ phase: 'inspect', activeLine: 4, message: `Value ${value} also occurs ${count} time(s), the same as value ${owner.get(count)}. Return false.`, snapshot: snap({ value, count, clash: owner.get(count) }) })
      result = false
      break
    }
    frames.push({ phase: 'inspect', activeLine: 4, message: `Count ${count} from value ${value} is not claimed yet.`, snapshot: snap({ value, count }) })
    owner.set(count, value)
    frames.push({ phase: 'update', activeLine: 5, message: `Claim count ${count} for value ${value}.`, snapshot: snap({ value, count }) })
  }
  frames.push({ phase: 'done', activeLine: result ? 6 : 4, message: result ? 'Every distinct value has its own occurrence count, so return true.' : 'Return false.', snapshot: snap({ result }) })
  return { input: { arr }, result, frames }
}
