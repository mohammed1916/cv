// Independently authored sorted-neighbour walkthrough. The values are our own sample data.
const MAX_VALUES = 30

export const code = [
  { line: 1, text: "function minimumAbsDifference(arr) {" },
  { line: 2, text: "  const sorted = [...arr].sort((a, b) => a - b)" },
  { line: 3, text: "  let best = Infinity" },
  { line: 4, text: "  let pairs = []" },
  { line: 5, text: "  for (let i = 0; i + 1 < sorted.length; i++) {" },
  { line: 6, text: "    const a = sorted[i]" },
  { line: 7, text: "    const b = sorted[i + 1]" },
  { line: 8, text: "    const gap = b - a" },
  { line: 9, text: "    if (gap < best) {" },
  { line: 10, text: "      best = gap" },
  { line: 11, text: "      pairs = [[a, b]]" },
  { line: 12, text: "    } else if (gap === best) {" },
  { line: 13, text: "      pairs.push([a, b])" },
  { line: 14, text: "    }" },
  { line: 15, text: "  }" },
  { line: 16, text: "  return pairs" },
  { line: 17, text: "}" },
]

export const python = `def minimum_abs_difference(arr):
    arr = sorted(arr)
    best = float("inf")
    pairs = []
    for a, b in zip(arr, arr[1:]):
        gap = b - a
        if gap < best:
            best = gap
            pairs = [[a, b]]
        elif gap == best:
            pairs.append([a, b])
    return pairs`

export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 6, 8: 6, 9: 7, 10: 8, 11: 9, 12: 10, 13: 11, 14: 11, 15: 11, 16: 12, 17: 12 }

export const phases = [
  { id: 'start', label: 'Sort', description: 'Sort the values. The closest pair must sit next to each other.' },
  { id: 'inspect', label: 'Check gap', description: 'Measure the gap between one neighbouring pair.' },
  { id: 'update', label: 'Record pair', description: 'Reset the answer for a smaller gap, or append a tied pair.' },
  { id: 'done', label: 'Result', description: 'Return every pair that attains the smallest gap.' },
]

export const inputLabel = 'Object with an arr array of distinct integers (JSON)'
export const complexity = 'O(n log n) for sorting, then one pass over the neighbouring pairs. The visualization accepts up to 30 values.'
export const examples = [
  { label: 'Several equal minimum gaps after sorting', input: '{"arr":[18,-4,7,25,2,12,-9,30,3,13]}' },
  { label: 'One pair', input: '{"arr":[-8,15]}' },
  { label: 'All neighboring gaps tie', input: '{"arr":[14,2,10,6]}' },
  { label: 'Unique smallest gap crosses zero', input: '{"arr":[-9,-1,1,8,17]}' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.arr)) throw new Error('Use an object with an arr array, such as {"arr":[4,1,9]}.')
  const { arr } = input
  if (arr.length < 2 || arr.length > MAX_VALUES) throw new Error(`arr needs 2 to ${MAX_VALUES} values.`)
  if (!arr.every(v => Number.isInteger(v) && v >= -10000 && v <= 10000)) throw new Error('Each value must be an integer from -10000 to 10000.')
  if (new Set(arr).size !== arr.length) throw new Error('arr values must be distinct.')
  return { arr: [...arr] }
}

export function buildTrace({ arr }) {
  const sorted = [...arr].sort((a, b) => a - b)
  const frames = []
  let best = Infinity
  let pairs = []
  const snap = (extra = {}) => ({
    sorted: [...sorted], best: Number.isFinite(best) ? best : null, pairs: pairs.map(p => [...p]), ...extra,
  })
  frames.push({ phase: 'start', activeLine: 1, message: `Sorted values: ${sorted.join(', ')}. Only neighbours need to be compared.`, snapshot: snap() })
  for (let i = 0; i + 1 < sorted.length; i++) {
    const a = sorted[i]
    const b = sorted[i + 1]
    const gap = b - a
    frames.push({ phase: 'inspect', activeLine: 8, message: `Neighbours ${a} and ${b} have gap ${gap}. The best so far is ${Number.isFinite(best) ? best : 'unset'}.`, snapshot: snap({ index: i, gap }) })
    if (gap < best) {
      best = gap
      pairs = [[a, b]]
      frames.push({ phase: 'update', activeLine: 11, message: `Gap ${gap} is smaller, so the answer restarts with [${a}, ${b}].`, snapshot: snap({ index: i, gap }) })
    } else if (gap === best) {
      pairs.push([a, b])
      frames.push({ phase: 'update', activeLine: 13, message: `Gap ${gap} ties the best, so [${a}, ${b}] is appended.`, snapshot: snap({ index: i, gap }) })
    }
  }
  frames.push({ phase: 'done', activeLine: 16, message: `Return ${pairs.length} pair(s) with gap ${best}.`, snapshot: snap() })
  return { input: { arr }, result: pairs.map(p => [...p]), frames }
}
