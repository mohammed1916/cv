export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums) || typeof input.s !== 'string') throw new Error('Use a JSON object with a nums array and a binary string s.')
  const n = input.nums.length
  if (n < 1 || n > 12 || input.s.length !== n) throw new Error('nums and s need the same length from 1 to 12.')
  if (input.nums.some(v => !Number.isInteger(v) || v < 1 || v > 9)) throw new Error('nums values are integers from 1 to 9.')
  if (![...input.s].every(c => c === '0' || c === '1')) throw new Error('s may only contain 0 and 1.')
  return input
}

const NEG = -Infinity

export function buildTrace(input) {
  const { nums, s } = input
  const n = nums.length
  const ones = []
  for (let i = 0; i < n; i++) if (s[i] === '1') ones.push(i)
  const frames = []
  if (ones.length === 0) {
    frames.push({ phase: 'done', activeLine: L('if ones is empty then return 0'), one: -1, position: -1, table: [], best: 0, message: 'There are no ones, so no swap is possible and the score is 0.' })
    return { input, result: 0, frames, ones }
  }
  let table = Array.from({ length: n }, (_, q) => (q <= ones[0] ? nums[q] : NEG))
  frames.push({ phase: 'one', activeLine: L('table = scores for the first one'), one: 0, position: ones[0], table: [...table], best: null, message: `The first one can reach indexes 0 to ${ones[0]}.` })
  for (let k = 1; k < ones.length; k++) {
    const p = ones[k]
    const next = Array.from({ length: n }, () => NEG)
    let prefixBest = NEG
    for (let q = 0; q <= p; q++) {
      if (q > 0) prefixBest = Math.max(prefixBest, table[q - 1])
      if (prefixBest > NEG) next[q] = nums[q] + prefixBest
    }
    table = next
    frames.push({ phase: 'one', activeLine: L('for each later one at position p'), one: k, position: p, table: [...table], best: null, message: `The one from index ${p} adds nums[q] to the best earlier score for each target q up to ${p}.` })
  }
  const result = Math.max(...table)
  frames.push({ phase: 'done', activeLine: L('return the largest value in table'), one: -1, position: -1, table: [...table], best: result, message: `Best score: ${result}.` })
  return { input, result, frames, ones }
}

export const code = `maximum score after binary swaps (nums, s):
  ones = positions of the ones in s, from left to right
  if ones is empty then return 0
  table = scores for the first one, at each reachable index up to its position
  for each later one at position p
    best prefix = the largest table value at an index before each target
    table = nums[q] plus best prefix, for each target q up to p
  return the largest value in table`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximum_score_after_binary_swaps(nums, s):
    n = len(nums)
    ones = [i for i in range(n) if s[i] == '1']
    if not ones:
        return 0
    NEG = float('-inf')
    table = [nums[q] if q <= ones[0] else NEG for q in range(n)]
    for p in ones[1:]:
        nxt = [NEG] * n
        prefix_best = NEG
        for q in range(p + 1):
            if q > 0:
                prefix_best = max(prefix_best, table[q - 1])
            if prefix_best > NEG:
                nxt[q] = nums[q] + prefix_best
        table = nxt
    return int(max(table))
`
