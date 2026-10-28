const MAX_LENGTH = 10

export function parseInput(text) {
  const data = JSON.parse(text)
  const { nums, k } = data ?? {}
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_LENGTH || nums.some(v => !Number.isInteger(v) || v < 1 || v > 9)) throw new Error(`nums must be 1 to ${MAX_LENGTH} integers from 1 to 9.`)
  if (!Number.isInteger(k) || k < 1 || k > 5) throw new Error('k must be an integer from 1 to 5.')
  return { nums, k }
}

export const code = `longest valid subsequence, where every neighbouring pair has the same sum modulo k
  set best to 1
  set length[i][r] to nothing for every index i and remainder r
  for each index i from 0 to n minus 1
    for each earlier index j from 0 to i minus 1
      set r to the remainder of nums[j] plus nums[i] modulo k
      set length[i][r] to the larger of length[i][r] and 2
      if length[j][r] is set then set length[i][r] to the larger of length[i][r] and length[j][r] plus 1
      set best to the larger of best and length[i][r]
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ nums, k }) {
  const n = nums.length
  const length = nums.map(() => new Map())
  let best = 1
  const frames = [{ phase: 'start', index: -1, j: null, r: null, best, activeLine: L('set best to 1'), message: 'Any single number is a valid subsequence of length 1.' }]
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      const r = (nums[j] + nums[i]) % k
      let candidate = 2
      if (length[j].has(r)) candidate = Math.max(candidate, length[j].get(r) + 1)
      if (!length[i].has(r) || candidate > length[i].get(r)) length[i].set(r, candidate)
      if (length[i].get(r) > best) best = length[i].get(r)
      frames.push({ phase: 'pair', index: i, j, r, best, activeLine: L('set length[i][r] to the larger of length[i][r] and 2'), message: `Pair ${nums[j]}, ${nums[i]} has sum remainder ${r}; chains ending at ${i} with remainder ${r} reach ${length[i].get(r)}.` })
    }
  }
  frames.push({ phase: 'done', index: n - 1, j: null, r: null, best, activeLine: L('return best'), message: `Longest valid subsequence: ${best}.` })
  return { input: { nums, k }, result: best, frames }
}

export const python = `def maximum_length_valid_subsequence_ii(nums, k):
    n = len(nums)
    length = [dict() for _ in range(n)]
    best = 1
    for i in range(n):
        for j in range(i):
            r = (nums[j] + nums[i]) % k
            candidate = 2
            if r in length[j]:
                candidate = max(candidate, length[j][r] + 1)
            if r not in length[i] or candidate > length[i][r]:
                length[i][r] = candidate
            best = max(best, length[i][r])
    return best
`
