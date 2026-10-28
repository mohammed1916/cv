export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums)) throw new Error('Use a JSON object with a nums array.')
  if (input.nums.length < 1 || input.nums.length > 10) throw new Error('nums needs 1 to 10 values (visualization cap).')
  if (input.nums.some(v => !Number.isInteger(v) || v < 0 || v > 63)) throw new Error('nums values are integers from 0 to 63.')
  return input
}

export function buildTrace(input) {
  const { nums } = input
  const n = nums.length
  const tables = []
  let best = 0
  const frames = [{ phase: 'start', activeLine: L('best = 0'), index: -1, best, table: null, message: 'Track, for each ending index, the best length for each bitwise AND value.' }]
  for (let i = 0; i < n; i++) {
    const cur = new Map([[nums[i], 1]])
    for (let j = 0; j < i; j++) {
      if (!(nums[j] < nums[i])) continue
      for (const [a, len] of tables[j]) {
        const na = a & nums[i]
        if ((cur.get(na) || 0) < len + 1) cur.set(na, len + 1)
      }
    }
    tables.push(cur)
    for (const [a, len] of cur) if (a !== 0 && len > best) best = len
    frames.push({ phase: 'end', activeLine: L('for each earlier index j'), index: i, best, table: [...cur].map(([a, len]) => `${a}:${len}`), message: `Best increasing subsequence ending at index ${i} with a non-zero AND so far: ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), index: -1, best, table: null, message: `Longest valid subsequence: ${best}.` })
  return { input, result: best, frames }
}

export const code = `longest increasing subsequence with non zero and (nums):
  best = 0
  for each index i in order
    table[i] = {nums[i]: 1}
    for each earlier index j with nums[j] less than nums[i]
      for each AND value a with length len in table[j]
        table[i][a and nums[i]] = the larger of its current value and len plus 1
    for each entry (a, len) in table[i] with a not zero
      best = the larger of best and len
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def longest_strictly_increasing_subsequence_with_non_zero_bitwise_and(nums):
    best = 0
    tables = []
    for i in range(len(nums)):
        cur = {nums[i]: 1}
        for j in range(i):
            if nums[j] < nums[i]:
                for a, length in tables[j].items():
                    na = a & nums[i]
                    if cur.get(na, 0) < length + 1:
                        cur[na] = length + 1
        tables.append(cur)
        for a, length in cur.items():
            if a != 0 and length > best:
                best = length
    return best
`
