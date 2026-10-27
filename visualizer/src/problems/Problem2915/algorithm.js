export function parseInput(text) {
  const data = JSON.parse(text)
  const { nums, target } = data ?? {}
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12 || nums.some(v => !Number.isInteger(v) || v < 1 || v > 30)) throw new Error('nums must be 1–12 integers from 1 to 30 (the search is shown in full).')
  if (!Number.isInteger(target) || target < 1 || target > 30) throw new Error('target must be an integer from 1 to 30.')
  return { nums, target }
}

export const code = `longest subsequence summing to target(nums, target):
  set best[0] to 0 and every other best[s] to unset
  for each number x in nums:
    for s from target down to x:
      if best[s - x] is set then
        best[s] = the larger of best[s] and best[s - x] + 1
  if best[target] is unset, return -1
  return best[target]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

const show = v => (v === null ? 'unset' : String(v))

// best[s] holds the longest subsequence seen so far with sum s. Scanning s downward uses each number at most once.
export function buildTrace({ nums, target }) {
  const best = Array(target + 1).fill(null)
  best[0] = 0
  const frames = [{ phase: 'start', best: [...best], item: null, cell: null, activeLine: L('set best[0] to 0'), message: `Find the longest subsequence whose sum is ${target}. best[s] is the longest length that reaches sum s.` }]
  nums.forEach((x, i) => {
    frames.push({ phase: 'item', best: [...best], item: i, cell: null, activeLine: L('for each number x in nums'), message: `Take nums[${i}] = ${x} into account.` })
    for (let s = target; s >= x; s--) {
      const prev = best[s - x]
      if (prev === null) {
        frames.push({ phase: 'cell', best: [...best], item: i, cell: s, activeLine: L('if best[s - x] is set'), message: `Sum ${s - x} is not reachable yet, so best[${s}] stays ${show(best[s])}.` })
      } else {
        best[s] = best[s] === null ? prev + 1 : Math.max(best[s], prev + 1)
        frames.push({ phase: 'cell', best: [...best], item: i, cell: s, activeLine: L('best[s] = the larger'), message: `best[${s}] = ${best[s]}, from sum ${s - x} plus ${x}.` })
      }
    }
  })
  const result = best[target] === null ? -1 : best[target]
  frames.push({ phase: 'done', best: [...best], item: null, cell: target, activeLine: result === -1 ? L('return -1') : L('return best[target]'), result, message: result === -1 ? `No subsequence sums to ${target}, so the answer is -1.` : `The longest subsequence summing to ${target} has length ${result}.` })
  return { input: { nums, target }, result, frames }
}

export const python = `def longest_subsequence(nums, target):
    best = [None] * (target + 1)
    best[0] = 0
    for x in nums:
        for s in range(target, x - 1, -1):
            if best[s - x] is not None:
                best[s] = best[s - x] + 1 if best[s] is None else max(best[s], best[s - x] + 1)
    return -1 if best[target] is None else best[target]
`
