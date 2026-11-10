// Independently authored frequency-set walkthrough. The arrays are our own sample data.
const MAX_VALUES = 40

export const code = [
  { line: 1, text: "function uniqueOccurrences(arr) {" },
  { line: 2, text: "  const counts = new Map()" },
  { line: 3, text: "  for (const v of arr) counts.set(v, (counts.get(v) ?? 0) + 1)" },
  { line: 4, text: "  const seen = new Set()" },
  { line: 5, text: "  for (const c of counts.values()) {" },
  { line: 6, text: "    if (seen.has(c)) return false" },
  { line: 7, text: "    seen.add(c)" },
  { line: 8, text: "  }" },
  { line: 9, text: "  return true" },
  { line: 10, text: "}" },
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

export const pythonLineMap = { 1: 3, 2: 4, 3: 4, 4: 5, 5: 6, 6: 7, 7: 9, 8: 9, 9: 10, 10: 10 }

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
  { label: 'Single value', input: '{\"arr\":[7]}' },
  { label: 'Two values share the same count', input: '{\"arr\":[4,4,9,9,1]}' },
  { label: 'Extreme values, each count once', input: '{\"arr\":[-1000,1000,0]}' },
  { label: 'Long run: 40 values', input: '{\"arr\":[8,11,-10,-6,13,-16,4,-3,1,17,-2,-8,8,9,4,-17,3,6,11,20,7,15,-5,12,9,1,-5,-1,18,-11,3,-10,-17,-9,5,-5,0,-7,-4,-4]}' },
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
  // Pass 1 (lines 2-3): the map is built completely before any count is compared.
  frames.push({ kind: 'init-map', phase: 'start', activeLine: 2, message: 'Create an empty map from value to occurrences.', snapshot: snap() })
  arr.forEach((v, position) => {
    frames.push({ kind: 'select', phase: 'start', activeLine: 3, message: `Take value ${v} at position ${position}.`, snapshot: snap({ position, value: v }) })
    const old = counts.get(v) ?? 0
    frames.push({ kind: 'read', phase: 'start', activeLine: 3, message: `Read the map entry for ${v}: ${old} so far.`, snapshot: snap({ position, value: v, old }) })
    counts.set(v, old + 1)
    frames.push({ kind: 'write', phase: 'start', activeLine: 3, message: `Write ${old + 1} as the occurrence count of ${v}.`, snapshot: snap({ position, value: v, old, count: old + 1 }) })
  })
  // Pass 2 (lines 4-9): every count is final, so each one can be checked against the claimed set.
  frames.push({ kind: 'init-set', phase: 'inspect', activeLine: 4, message: 'Create an empty set of claimed counts.', snapshot: snap() })
  let result = true
  for (const [value, count] of counts) {
    frames.push({ kind: 'select-count', phase: 'inspect', activeLine: 5, message: `Take the count ${count} from value ${value}.`, snapshot: snap({ value, count }) })
    if (owner.has(count)) {
      frames.push({ kind: 'clash', phase: 'inspect', activeLine: 6, message: `Value ${value} occurs ${count} time(s), but value ${owner.get(count)} already claimed ${count}. Return false.`, snapshot: snap({ value, count, clash: owner.get(count) }) })
      result = false
      break
    }
    frames.push({ kind: 'check-free', phase: 'inspect', activeLine: 6, message: `${count} is not in the claimed set, so the check passes.`, snapshot: snap({ value, count }) })
    owner.set(count, value)
    frames.push({ kind: 'claim', phase: 'update', activeLine: 7, message: `Add ${count} to the claimed set for value ${value}.`, snapshot: snap({ value, count }) })
  }
  frames.push({ kind: 'done', phase: 'done', activeLine: result ? 9 : 6, message: result ? 'Every distinct value has its own occurrence count, so return true.' : 'Return false.', snapshot: snap({ result }) })
  return { input: { arr }, result, frames }
}
