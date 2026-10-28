export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with nums and m, for example {"nums":[1,3,-5,5,6,-4],"m":3}.')
  const { nums, m } = data
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 10) throw new Error('nums must have 1 to 10 entries.')
  if (nums.some(x => !Number.isInteger(x) || Math.abs(x) > 100)) throw new Error('Each value is an integer from -100 to 100.')
  if (!Number.isInteger(m) || m < 1 || m > nums.length) throw new Error('m must be an integer from 1 to the length of nums.')
  return { nums: [...nums], m }
}

export function buildTrace(input) {
  const { nums, m } = input
  const n = nums.length
  let best = null
  let bestPair = null
  const frames = [{ phase: 'start', activeLine: L('set best to nothing'), first: null, last: null, best: null, message: 'Try every first index i. The last index j must leave room for m minus 2 elements between them.' }]
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      if (m === 1 ? j !== i : j - i < m - 1) continue
      const product = nums[i] * nums[j]
      if (best === null || product > best) { best = product; bestPair = [i, j] }
    }
    frames.push({ phase: 'first', activeLine: L('for each first index i'), first: i, last: null, best, message: `Checked every last index that works with first index ${i}. Best product so far: ${best === null ? 'none' : best}.` })
  }
  const result = best
  frames.push({ phase: 'done', activeLine: L('return best'), first: bestPair ? bestPair[0] : null, last: bestPair ? bestPair[1] : null, best: result, message: `The largest product is ${result}.` })
  return { input, result, frames }
}

export const code = `maximum product of first and last (nums, m)
  set best to nothing
  for each first index i
    for each last index j at or after i
      if m is 1 then only j equal to i counts
      otherwise j minus i must be at least m minus 1, so that m minus 2 elements fit between them
      if the product of nums[i] and nums[j] is larger than best then set best to it
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_first_last_product(nums, m):
    n = len(nums)
    best = None
    for i in range(n):
        for j in range(i, n):
            if m == 1:
                if j != i:
                    continue
            elif j - i < m - 1:
                continue
            product = nums[i] * nums[j]
            if best is None or product > best:
                best = product
    return best
`
