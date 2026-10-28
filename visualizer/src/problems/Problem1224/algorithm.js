const MAX_LENGTH = 12
const MAX_VALUE = 5

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_LENGTH) throw new Error(`Use an array of 1 to ${MAX_LENGTH} integers.`)
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > MAX_VALUE)) throw new Error(`Values are integers from 1 to ${MAX_VALUE}.`)
  return nums
}

export const code = `longest prefix that stays fair after removing one element
  set count to an empty map from value to occurrences
  set freq to an empty map from occurrences to number of values
  set best to 0
  for each index i from 0 to n minus 1
    raise the count of nums[i] by one in count and move it in freq
    set top to the largest count, and size to i plus 1
    if top is 1, or one value has count 1 and every other count is top, or one value has count top and every other count is top minus 1 then
      set best to size
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// Fairness of a prefix depends only on the largest count and the count-of-counts table.
const fair = (top, size, freq) => top === 1
  || (freq.get(1) === 1 && (freq.get(top) ?? 0) * top === size - 1)
  || ((freq.get(top) ?? 0) === 1 && (freq.get(top - 1) ?? 0) * (top - 1) + top === size)

export function buildTrace(nums) {
  const count = new Map()
  const freq = new Map()
  let best = 0
  let top = 0
  const frames = [{ phase: 'start', index: -1, best, top, counts: {}, ok: null, activeLine: L('set count'), message: 'Walk the prefixes from left to right and track how often each value appears.' }]
  nums.forEach((v, i) => {
    const before = count.get(v) ?? 0
    if (before > 0) {
      freq.set(before, freq.get(before) - 1)
      if (freq.get(before) === 0) freq.delete(before)
    }
    count.set(v, before + 1)
    freq.set(before + 1, (freq.get(before + 1) ?? 0) + 1)
    top = Math.max(top, before + 1)
    const counts = Object.fromEntries(count)
    frames.push({ phase: 'add', index: i, best, top, counts, ok: null, activeLine: L('raise the count'), message: `Add ${v}; it now appears ${before + 1} time${before === 0 ? '' : 's'}.` })
    const ok = fair(top, i + 1, freq)
    if (ok) best = i + 1
    frames.push({ phase: 'check', index: i, best, top, counts, ok, activeLine: L('if top is 1'), message: ok ? `Prefix of length ${i + 1} stays fair after one removal, so best is ${best}.` : `Prefix of length ${i + 1} cannot be made fair with one removal.` })
  })
  frames.push({ phase: 'done', index: nums.length - 1, best, top, counts: Object.fromEntries(count), ok: null, activeLine: L('return best'), message: `Longest fair prefix: ${best}.` })
  return { input: nums, result: best, frames }
}

export const python = `def maximum_equal_frequency(nums):
    count = {}
    freq = {}
    best = 0
    top = 0
    for i, v in enumerate(nums):
        before = count.get(v, 0)
        if before > 0:
            freq[before] -= 1
            if freq[before] == 0:
                del freq[before]
        count[v] = before + 1
        freq[before + 1] = freq.get(before + 1, 0) + 1
        top = max(top, before + 1)
        size = i + 1
        if top == 1 or (freq.get(1) == 1 and freq.get(top, 0) * top == size - 1) or (freq.get(top, 0) == 1 and freq.get(top - 1, 0) * (top - 1) + top == size):
            best = size
    return best
`
