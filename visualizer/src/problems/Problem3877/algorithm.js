export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums) || !Number.isInteger(obj.target)) throw new Error('Use a JSON object with a "nums" array and an integer "target".')
  const { nums, target } = obj
  if (nums.length < 1 || nums.length > 14) throw new Error('nums must have 1 to 14 entries for this visualization.')
  if (nums.some(v => !Number.isInteger(v) || v < 0 || v > 10000)) throw new Error('Each value must be an integer from 0 to 10000.')
  if (target < 0 || target > 10000) throw new Error('target must be an integer from 0 to 10000.')
  return { nums, target }
}

export function buildTrace({ nums, target }) {
  // reach maps each XOR value to the largest number of kept elements that produce it.
  let reach = new Map([[0, 0]])
  const frames = [{ phase: 'start', activeLine: L('set reach to'), value: null, size: 1, kept: null, result: null, message: 'The empty subset has XOR 0 and keeps 0 elements.' }]
  for (const v of nums) {
    const next = new Map(reach)
    for (const [x, c] of [...reach]) {
      const nx = x ^ v
      if (!next.has(nx) || next.get(nx) < c + 1) next.set(nx, c + 1)
    }
    reach = next
    frames.push({ phase: 'add', activeLine: L('for each xor value'), value: v, size: reach.size, kept: null, result: null, message: `Adding ${v}: ${reach.size} XOR values are now reachable.` })
  }
  const kept = reach.has(target) ? reach.get(target) : null
  const result = kept === null ? -1 : nums.length - kept
  frames.push({ phase: 'done', activeLine: kept === null ? L('return -1') : L('return the length'), value: null, size: reach.size, kept, result,
    message: kept === null ? `No subset has XOR ${target}, so the answer is -1.` : `Keep ${kept} elements, so remove ${result}.` })
  return { input: { nums, target }, result, frames }
}

export const code = `minimum removals to achieve target xor (nums, target):
  set reach to a table holding 0 with count 0 (the empty subset)
  for each value v in nums
    for each xor value x in a copy of reach, with its count c
      set nx to x xor v
      if nx is not in reach, or c plus 1 is larger than reach[nx], then
        set reach[nx] to c plus 1
  if target is in reach then
    return the length of nums minus reach[target]
  return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_removals_target_xor(nums, target):
    reach = {0: 0}
    for v in nums:
        for x, c in list(reach.items()):
            nx = x ^ v
            if nx not in reach or reach[nx] < c + 1:
                reach[nx] = c + 1
    if target in reach:
        return len(nums) - reach[target]
    return -1
`
