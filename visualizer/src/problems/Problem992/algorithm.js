// Exactly k distinct values is the same as at most k minus at most k - 1. Count the subarrays with at most a limit
// of distinct values with a sliding window: r extends the window, and l moves right until the window is valid again.
// Every subarray that ends at r and starts between l and r is then valid, which adds r - l + 1 at once.
export const code = String.raw`function subarraysWithKDistinct(nums, k) {
  const atMost = limit => {
    const count = new Map(); // occurrences of each value inside the window [l, r]
    let l = 0, distinct = 0, total = 0;
    for (let r = 0; r < nums.length; r++) {
      const x = nums[r];
      if (!count.get(x)) distinct++;
      count.set(x, (count.get(x) ?? 0) + 1);
      while (distinct > limit) {
        const y = nums[l];
        count.set(y, count.get(y) - 1);
        if (count.get(y) === 0) distinct--;
        l++;
      }
      total += r - l + 1;
    }
    return total;
  };
  return atMost(k) - atMost(k - 1);
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`Missing JavaScript line for "${s}"`); return i + 1 }

export const python = String.raw`def subarrays_with_k_distinct(nums, k):
    def at_most(limit):
        count = {}  # occurrences of each value inside the window [l, r]
        l = 0
        distinct = 0
        total = 0
        for r, x in enumerate(nums):
            if count.get(x, 0) == 0:
                distinct += 1
            count[x] = count.get(x, 0) + 1
            while distinct > limit:
                y = nums[l]
                count[y] -= 1
                if count[y] == 0:
                    distinct -= 1
                l += 1
            total += r - l + 1
        return total
    return at_most(k) - at_most(k - 1)`
const PYL = python.split('\n')
const PY = s => { const i = PYL.findIndex(t => t.includes(s)); if (i < 0) throw new Error(`Missing Python line for "${s}"`); return i + 1 }

export const phases = [
  { id: 'most', label: 'At most k', description: 'Count windows with at most k distinct values.' },
  { id: 'fewer', label: 'At most k-1', description: 'Count windows with at most k - 1 distinct values.' },
  { id: 'done', label: 'Difference', description: 'Subtract: the subarrays with exactly k distinct values.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  const nums = input && input.nums
  const k = input && input.k
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Use nums: a list of 1 to 12 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 9)) throw new Error('Values must be integers from 1 to 9.')
  if (!Number.isInteger(k) || k < 1 || k > 9) throw new Error('k must be an integer from 1 to 9.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const frames = []
  let total = 0
  const pass = (limit, phase) => {
    const count = new Map()
    let l = 0, distinct = 0, subtotal = 0
    for (let r = 0; r < nums.length; r++) {
      const x = nums[r]
      if (!count.get(x)) distinct++
      count.set(x, (count.get(x) ?? 0) + 1)
      frames.push({ phase, activeLine: L('if (!count.get(x))'), pythonLine: PY('count[x] = count.get(x, 0) + 1'), l, r, limit, distinct, subtotal, window: [...count.entries()].filter(([, c]) => c > 0), total: null,
        message: `Extend the window to index ${r} (value ${x}). ${distinct} distinct value(s) in the window; the limit is ${limit}.` })
      while (distinct > limit) {
        const y = nums[l]
        count.set(y, count.get(y) - 1)
        if (count.get(y) === 0) distinct--
        l++
        frames.push({ phase, activeLine: L('l++'), pythonLine: PY('l += 1'), l, r, limit, distinct, subtotal, window: [...count.entries()].filter(([, c]) => c > 0), total: null,
          message: `Too many distinct values, so drop index ${l - 1} (value ${y}) from the left. The window is now ${l} to ${r}.` })
      }
      subtotal += r - l + 1
      frames.push({ phase, activeLine: L('total += r - l + 1'), pythonLine: PY('total += r - l + 1'), l, r, limit, distinct, subtotal, window: [...count.entries()].filter(([, c]) => c > 0), total: null,
        message: `${r - l + 1} subarray(s) end at index ${r} and have at most ${limit} distinct values.` })
    }
    return subtotal
  }
  const most = pass(k, 'most')
  const fewer = pass(k - 1, 'fewer')
  total = most - fewer
  frames.push({ phase: 'done', activeLine: L('return atMost(k) - atMost(k - 1)'), pythonLine: PY('return at_most(k) - at_most(k - 1)'), l: null, r: null, limit: k, distinct: null, subtotal: total, window: [], total,
    message: `${most} subarrays have at most ${k} distinct values, and ${fewer} have at most ${k - 1}. The difference is ${total}.` })
  return { input: { nums, k }, result: total, frames }
}
