export function parseInput(text) {
  const data = JSON.parse(text)
  const { nums, k } = data ?? {}
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 8) throw new Error('Use "nums" as an array of 1 to 8 integers.')
  if (nums.some(x => !Number.isInteger(x) || x < 0 || x > 31)) throw new Error('Each number is an integer from 0 to 31.')
  if (!Number.isInteger(k) || k < 1 || k > nums.length) throw new Error('"k" is an integer from 1 to the length of nums.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  let result = 0
  const counts = []
  const frames = [{ phase: 'start', activeLine: L('set result to 0'), bit: -1, counts: [], result, message: `Need ${k} numbers with a bit set for it to count.` }]
  for (let bit = 0; bit < 6; bit++) {
    const count = nums.filter(x => (x >> bit) & 1).length
    counts.push(count)
    if (count >= k) result |= 1 << bit
    frames.push({ phase: 'bit', activeLine: L('count how many numbers have that bit set'), bit, counts: [...counts], result, message: `Bit ${bit} is set in ${count} numbers${count >= k ? ', so it is kept' : ''}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return result'), bit: -1, counts: [...counts], result, message: `K-or: ${result}.` })
  return { input: { nums, k }, result, frames }
}

export const code = `k-or of nums, given nums and k
  set result to 0
  for each bit position from 0 to 5
    count how many numbers have that bit set
    if the count is at least k then set that bit in result
  return result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def find_k_or(nums, k):
    result = 0
    for bit in range(6):
        count = sum(1 for x in nums if (x >> bit) & 1)
        if count >= k:
            result |= 1 << bit
    return result
`
