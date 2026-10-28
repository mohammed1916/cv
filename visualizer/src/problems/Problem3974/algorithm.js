export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Array.isArray(data.nums) || !Number.isInteger(data.k) || !Number.isInteger(data.mul)) throw new Error('Use {"nums": [...], "k": k, "mul": mul}.')
  const { nums, k, mul } = data
  if (nums.length < 1 || nums.length > 8) throw new Error('nums must have 1 to 8 entries for the visualization.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 20)) throw new Error('nums entries are integers from 1 to 20.')
  if (k < 1 || k > nums.length) throw new Error('k is an integer from 1 to nums.length.')
  if (mul < 1 || mul > 20) throw new Error('mul is an integer from 1 to 20.')
  return { nums, k, mul }
}

export function buildTrace(input) {
  const { nums, k, mul } = input
  const sorted = [...nums].sort((a, b) => b - a)
  let total = 0
  const frames = [{ phase: 'start', activeLine: L('let sorted be'), step: -1, factor: null, total, message: `Sort the values from largest to smallest and take the first ${k}.` }]
  for (let i = 0; i < k; i++) {
    const raw = mul - i
    const factor = raw < 1 ? 1 : raw
    total += sorted[i] * factor
    frames.push({ phase: 'step', activeLine: L('add sorted'), step: i, factor, total, message: `Step ${i + 1}: value ${sorted[i]} with factor ${factor} (mul is ${raw}). Total ${total}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), step: -1, factor: null, total, message: `Maximum total: ${total}.` })
  return { input, result: total, frames }
}

export const code = `maximum total of k selected elements with multiplier mul
  let sorted be nums sorted from largest to smallest
  let total be 0
  for each step i from 0 to k minus 1
    let factor be mul minus i
    if factor is less than 1 then use 1 instead
    add sorted[i] times factor to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximum_total_sum_of_k_selected(nums, k, mul):
    sorted_nums = sorted(nums, reverse=True)
    total = 0
    for i in range(k):
        factor = mul - i
        if factor < 1:
            factor = 1
        total += sorted_nums[i] * factor
    return total
`
