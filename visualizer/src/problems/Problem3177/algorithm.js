const MAX_LENGTH = 12

export function parseInput(text) {
  const data = JSON.parse(text)
  const { nums, k } = data ?? {}
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_LENGTH || nums.some(v => !Number.isInteger(v) || v < 1 || v > 4)) throw new Error(`nums must be 1 to ${MAX_LENGTH} integers from 1 to 4.`)
  if (!Number.isInteger(k) || k < 0 || k > 3) throw new Error('k must be an integer from 0 to 3.')
  return { nums, k }
}

export const code = `length of the longest good subsequence, where at most k neighbours differ
  set best to 0 and best-by-value to an empty map
  for each number x in nums, in order
    set row[c] for each count c from 0 to k
      start a new subsequence with 0 changes, or extend the best chain of value x with the same count
      or extend the best chain of any other value with one fewer change
    add each row entry into best-by-value[x], keeping the larger
    set best to the largest value in row
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ nums, k }) {
  const bestByValue = new Map()
  let best = 0
  const frames = [{ phase: 'start', index: -1, value: null, row: null, best: 0, activeLine: L('set best to 0'), message: 'No subsequence yet.' }]
  nums.forEach((x, i) => {
    const row = Array(k + 1).fill(null)
    for (let c = 0; c <= k; c++) {
      let candidate = c === 0 ? 1 : null
      const same = bestByValue.get(x)?.[c] ?? null
      if (same !== null && (candidate === null || same + 1 > candidate)) candidate = same + 1
      if (c >= 1) {
        for (const [v, chains] of bestByValue) {
          if (v === x || chains[c - 1] === null) continue
          if (candidate === null || chains[c - 1] + 1 > candidate) candidate = chains[c - 1] + 1
        }
      }
      row[c] = candidate
    }
    const own = bestByValue.get(x) ?? Array(k + 1).fill(null)
    for (let c = 0; c <= k; c++) {
      if (row[c] !== null && (own[c] === null || row[c] > own[c])) own[c] = row[c]
    }
    bestByValue.set(x, own)
    const rowBest = Math.max(...row.filter(v => v !== null))
    if (rowBest > best) best = rowBest
    frames.push({ phase: 'value', index: i, value: x, row: [...row], best, activeLine: L('add each row entry into best-by-value'), message: `Value ${x} at index ${i}: best chain ending here is ${rowBest}; overall ${best}.` })
  })
  frames.push({ phase: 'done', index: nums.length - 1, value: null, row: null, best, activeLine: L('return best'), message: `Longest good subsequence: ${best}.` })
  return { input: { nums, k }, result: best, frames }
}

export const python = `def maximum_length_good_subsequence_ii(nums, k):
    best_by_value = {}
    best = 0
    for x in nums:
        row = [None] * (k + 1)
        for c in range(k + 1):
            candidate = 1 if c == 0 else None
            same = best_by_value.get(x, [None] * (k + 1))[c]
            if same is not None and (candidate is None or same + 1 > candidate):
                candidate = same + 1
            if c >= 1:
                for v, chains in best_by_value.items():
                    if v == x or chains[c - 1] is None:
                        continue
                    if candidate is None or chains[c - 1] + 1 > candidate:
                        candidate = chains[c - 1] + 1
            row[c] = candidate
        own = best_by_value.get(x, [None] * (k + 1))
        for c in range(k + 1):
            if row[c] is not None and (own[c] is None or row[c] > own[c]):
                own[c] = row[c]
        best_by_value[x] = own
        best = max([best] + [v for v in row if v is not None])
    return best
`
