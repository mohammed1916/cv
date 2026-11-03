export const phases = [
  { id: 'start', label: 'Start', description: 'Read the list. Every single value is a subsequence of length one.' },
  { id: 'inspect', label: 'Pair', description: 'Pair the current end with an earlier index and measure their difference.' },
  { id: 'update', label: 'Extend', description: 'Look up the same difference ending at the earlier index, then record the longer chain here.' },
  { id: 'done', label: 'Return', description: 'Return the longest chain found across all ends.' },
]

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 40) throw new Error('Enter a JSON array of 1–40 integers.')
  if (nums.some(v => !Number.isInteger(v) || Math.abs(v) > 10000)) throw new Error('Each value must be an integer between −10,000 and 10,000.')
  return nums
}

// Each end index i owns a map: difference -> length of the best chain that ends at i with that difference.
export function buildTrace(nums) {
  const n = nums.length
  const table = Array.from({ length: n }, () => new Map())
  const frames = []
  let best = Math.min(n, 2)
  const copyTable = () => table.map(m => Array.from(m, ([diff, len]) => ({ diff, len })))
  const push = (phase, activeLine, message, extra = {}) => frames.push({
    phase, activeLine, message,
    snapshot: { table: copyTable(), best, ...extra },
  })

  push('start', 2, `The list has ${n} value${n === 1 ? '' : 's'}. Single values are chains of length 1; the best starts at ${best}.`, { i: -1, j: -1 })
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      const diff = nums[i] - nums[j]
      const before = table[j].get(diff) ?? 1
      push('inspect', 7, `Pair ends at ${i} (value ${nums[i]}) with earlier index ${j} (value ${nums[j]}): difference ${diff}.`, { i, j, diff, before })
      const len = before + 1
      const previous = table[i].get(diff) ?? 0
      table[i].set(diff, Math.max(previous, len))
      best = Math.max(best, table[i].get(diff))
      push('update', 9, `Chain length ${before} at ${j} plus this value gives ${len} at ${i} for difference ${diff}. Best is now ${best}.`, { i, j, diff, before, len })
    }
  }
  frames.push({ phase: 'done', activeLine: 11, message: `No longer chain exists, so the answer is ${best}.`, snapshot: { table: copyTable(), best, i: -1, j: -1 } })
  return { input: nums, result: best, frames }
}

export const code = [
  'FUNCTION longestArithmetic(nums)',
  '    n ← length of nums',
  '    best ← min(n, 2)',
  '    table ← one empty map per index',
  '    FOR i FROM 0 TO n − 1',
  '        FOR j FROM 0 TO i − 1',
  '            d ← nums[i] − nums[j]',
  '            len ← table[j][d] (or 1 if absent) + 1',
  '            table[i][d] ← max(table[i][d], len)',
  '            best ← max(best, table[i][d])',
  '    RETURN best',
]

export const python = `def longest_arithmetic(nums):
    n = len(nums)
    best = min(n, 2)
    table = [dict() for _ in range(n)]
    for i in range(n):
        for j in range(i):
            d = nums[i] - nums[j]
            length = table[j].get(d, 1) + 1
            table[i][d] = max(table[i].get(d, 0), length)
            best = max(best, table[i][d])
    return best`

export const pythonLineMap = { 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, 11: 11 }
