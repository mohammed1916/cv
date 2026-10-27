export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with nums and k.')
  const { nums, k } = data
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 8) throw new Error('nums must be an array of 1 to 8 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 0 || v > 15)) throw new Error('Each value is an integer from 0 to 15.')
  if (!Number.isInteger(k) || k < 0 || k > 7) throw new Error('k must be an integer from 0 to 7.')
  return { nums, k }
}

// Fewest merges so that every remaining element is a submask of mask, or null if impossible.
function mergesNeeded(nums, mask) {
  const n = nums.length
  const best = Array(n + 1).fill(null)
  best[0] = 0
  for (let e = 1; e <= n; e++) {
    let and = -1
    for (let s = e - 1; s >= 0; s--) {
      and &= nums[s]
      if (best[s] !== null && (and & ~mask) === 0) best[e] = Math.max(best[e] ?? 0, best[s] + 1)
    }
  }
  return best[n] === null ? null : n - best[n]
}

export function buildTrace({ nums, k }) {
  const top = 32 - Math.clz32(Math.max(...nums))
  let answer = (1 << top) - 1
  const frames = []
  frames.push({ phase: 'start', activeLine: L('set answer to all ones'), bit: -1, candidate: answer, merges: null, answer, message: `Start with ${answer}, which keeps every bit.` })
  for (let bit = top - 1; bit >= 0; bit--) {
    const candidate = answer & ~(1 << bit)
    const merges = mergesNeeded(nums, candidate)
    if (merges !== null && merges <= k) {
      answer = candidate
      frames.push({ phase: 'drop', activeLine: L('if fewest merges for candidate'), bit, candidate, merges, answer, message: `Bit ${bit} can be cleared with ${merges} merge(s), within ${k}.` })
    } else {
      frames.push({ phase: 'keep', activeLine: L('if fewest merges for candidate'), bit, candidate, merges, answer, message: `Bit ${bit} must stay: clearing it needs ${merges === null ? 'an impossible split' : merges + ' merges'}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return answer'), bit: -1, candidate: null, merges: null, answer, message: `Minimum OR of the remaining elements: ${answer}.` })
  return { input: { nums, k }, result: answer, frames }
}

export const code = `minimum OR of the remaining elements after at most k merges
  set answer to all ones up to the top bit of the largest value
  for each bit from the top bit down to bit 0 do
    set candidate to answer with this bit cleared
    if fewest merges for candidate is at most k then set answer to candidate
  return answer
fewest merges for a mask m, where each segment AND must be a submask of m
  set best[0] to 0 and every other best[] to nothing
  for each end e from 1 to n do
    for each start s from e - 1 down to 0 do
      if best[s] is set and the AND of nums[s..e-1] is a submask of m then
        set best[e] to the larger of best[e] and best[s] + 1
  return n minus best[n], or nothing if best[n] is nothing`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error('missing code line: ' + s); return i + 1 }

export const python = `def min_or_after_merges(nums, k):
    n = len(nums)
    top = max(nums).bit_length()

    def merges_needed(mask):
        best = [None] * (n + 1)
        best[0] = 0
        for e in range(1, n + 1):
            acc = -1
            for s in range(e - 1, -1, -1):
                acc &= nums[s]
                if best[s] is not None and (acc & ~mask) == 0:
                    if best[e] is None or best[s] + 1 > best[e]:
                        best[e] = best[s] + 1
        return None if best[n] is None else n - best[n]

    answer = (1 << top) - 1
    for bit in range(top - 1, -1, -1):
        candidate = answer & ~(1 << bit)
        needed = merges_needed(candidate)
        if needed is not None and needed <= k:
            answer = candidate
    return answer
`
