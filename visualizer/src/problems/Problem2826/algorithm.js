export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a nums array.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums must have 1 to 12 entries.')
  if (nums.some(v => ![1, 2, 3].includes(v))) throw new Error('Each value must be 1, 2 or 3.')
  return { nums }
}

export function buildTrace(input) {
  const { nums } = input
  // best[v] is the longest kept run that ends with a value v.
  const best = [0, 0, 0, 0]
  const frames = [{ phase: 'start', activeLine: L('set best[1], best[2], best[3]'), value: null, best: [...best], message: 'No values kept yet.' }]
  for (const v of nums) {
    best[v] = 1 + Math.max(...best.slice(1, v + 1))
    frames.push({ phase: 'value', activeLine: L('set best[v] to'), value: v, best: [...best], message: `Value ${v} can extend a kept run of length ${best[v] - 1}; the longest ending at ${v} is now ${best[v]}.` })
  }
  const kept = Math.max(...best)
  const result = nums.length - kept
  frames.push({ phase: 'done', activeLine: L('return n minus'), value: null, best: [...best], message: `Keep ${kept} values and delete ${result}.` })
  return { input, result, frames }
}

export const code = `minimum deletions to sort three groups (nums):
  set best[1], best[2], best[3] to 0
  for each value v in nums:
    set best[v] to 1 plus the largest of best[1] through best[v]
  return n minus the largest value in best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_deletions(nums):
    best = [0, 0, 0, 0]
    for v in nums:
        best[v] = 1 + max(best[1:v + 1])
    return len(nums) - max(best)
`
