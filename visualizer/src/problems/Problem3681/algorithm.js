export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 12) throw new Error('Use an array of 2 to 12 integers in this visualization.')
  if (nums.some(v => !Number.isInteger(v) || v < 0 || v > 1000000000)) throw new Error('Values are integers from 0 to 1000000000.')
  return nums
}

export function buildTrace(nums) {
  const basis = new Array(31).fill(0)
  const frames = [{ phase: 'start', activeLine: L('set basis to 31 zeros'), value: null, best: 0, message: 'The basis is empty.' }]
  for (const x0 of nums) {
    let x = x0
    for (let b = 30; b >= 0; b--) {
      if (!((x >>> b) & 1)) continue
      if (basis[b] === 0) { basis[b] = x; break }
      x ^= basis[b]
    }
    frames.push({ phase: 'insert', activeLine: L('reduce the value by the basis'), value: x0, best: null, message: `Insert ${x0}: basis now has ${basis.filter(v => v).length} vectors.` })
  }
  let res = 0
  for (let b = 30; b >= 0; b--) if (basis[b] && (res ^ basis[b]) > res) res ^= basis[b]
  frames.push({ phase: 'done', activeLine: L('return the best value'), value: null, best: res, message: `Largest value in the span: ${res}.` })
  return { input: nums, result: res, frames }
}

export const code = `maximum XOR of subsequences (nums):
  set basis to 31 zeros, one slot per bit
  for each value x in nums do
    reduce the value by the basis from the top bit down
    if a bit is set with an empty slot then store the value there
  set best to 0
  for each slot from the top bit down do
    if the slot is set and best XOR the slot is larger than best then update best
  return the best value`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_xor_of_subsequences(nums):
    basis = [0] * 31
    for x in nums:
        for b in range(30, -1, -1):
            if not (x >> b) & 1:
                continue
            if basis[b] == 0:
                basis[b] = x
                break
            x ^= basis[b]
    best = 0
    for b in range(30, -1, -1):
        if basis[b] and (best ^ basis[b]) > best:
            best ^= basis[b]
    return best
`
