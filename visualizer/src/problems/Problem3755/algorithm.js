export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums)) throw new Error('Use an object with a nums array.')
  if (obj.nums.length < 1 || obj.nums.length > 12) throw new Error('Use 1 to 12 values for the visualization.')
  if (obj.nums.some(v => !Number.isInteger(v) || v < 0 || v > 1000000000)) throw new Error('Values are integers from 0 to 1000000000.')
  return { nums: obj.nums }
}

export function buildTrace(input) {
  const { nums } = input
  const first = new Map([['0|0', 0]])
  let xor = 0, balance = 0, best = 0
  const frames = [{ phase: 'start', activeLine: L('set first to', ), index: -1, best: 0, key: '0|0', message: 'The empty prefix has XOR 0 and balance 0. Remember where each key first appears.' }]
  for (let i = 0; i < nums.length; i++) {
    xor ^= nums[i]
    balance += nums[i] % 2 === 0 ? 1 : -1
    const t = i + 1
    const key = `${xor}|${balance}`
    if (first.has(key)) {
      best = Math.max(best, t - first.get(key))
      frames.push({ phase: 'match', activeLine: L('if the key is in first'), index: i, best, key, message: `Prefix ${t} has the same XOR and balance as prefix ${first.get(key)}. Subarray length ${t - first.get(key)}.` })
    } else {
      first.set(key, t)
      frames.push({ phase: 'record', activeLine: L('otherwise record'), index: i, best, key, message: `New key ${key} at prefix ${t}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), index: -1, best, key: '', message: `Longest balanced subarray: ${best}.` })
  return { input, result: best, frames }
}

export const code = `longest balanced subarray:
  set first to a map with key (0, 0) at position 0
  set xor to 0, balance to 0, and best to 0
  for each index i in nums:
    xor with nums[i], and add 1 to balance if nums[i] is even, else subtract 1
    let t be i + 1 and key be (xor, balance)
    if the key is in first then
      set best to the larger of best and t minus first[key]
    otherwise record first[key] to t
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_balanced_xor_length(nums):
    first = {(0, 0): 0}
    xor = 0
    balance = 0
    best = 0
    for i, x in enumerate(nums):
        xor ^= x
        balance += 1 if x % 2 == 0 else -1
        t = i + 1
        key = (xor, balance)
        if key in first:
            best = max(best, t - first[key])
        else:
            first[key] = t
    return best
`
