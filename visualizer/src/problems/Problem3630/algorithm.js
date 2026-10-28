export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 8) throw new Error('Use an array of 1 to 8 integers in this visualization.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 1000000000)) throw new Error('Values are integers from 1 to 1000000000.')
  return nums
}

// A state is [xorA, andB, xorC]; andB = -1 means B is still empty.
const key = s => s.join(',')

export function buildTrace(nums) {
  let states = new Map([[key([0, -1, 0]), [0, -1, 0]]])
  const frames = [{ phase: 'start', activeLine: L('set states to one'), index: -1, count: states.size, message: 'Start with A, B and C all empty.' }]
  for (const v of nums) {
    const next = new Map()
    for (const [xa, ab, xc] of states.values()) {
      for (const s of [[xa ^ v, ab, xc], [xa, ab === -1 ? v : ab & v, xc], [xa, ab, xc ^ v]]) next.set(key(s), s)
    }
    states = next
    frames.push({ phase: 'element', activeLine: L('for each value v'), index: nums.indexOf(v), count: states.size, value: v, message: `Place ${v} in A, B or C. ${states.size} distinct states.` })
  }
  let result = 0
  for (const [xa, ab, xc] of states.values()) result = Math.max(result, xa + (ab === -1 ? 0 : ab) + xc)
  frames.push({ phase: 'done', activeLine: L('return the largest'), index: -1, count: states.size, message: `Best total: ${result}.` })
  return { input: nums, result, frames }
}

export const code = `max XOR and AND partition (nums):
  set states to one state with A's XOR 0, B empty, C's XOR 0
  for each value v in nums do
    make an empty set of next states
    for each state in states do
      add the state with v put in A, in B, and in C to next states
    replace states with next states
  return the largest value of XOR(A) + AND(B) + XOR(C) over states`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_xor_and_partition(nums):
    states = {(0, -1, 0)}
    for v in nums:
        nxt = set()
        for xa, ab, xc in states:
            nxt.add((xa ^ v, ab, xc))
            nxt.add((xa, v if ab == -1 else ab & v, xc))
            nxt.add((xa, ab, xc ^ v))
        states = nxt
    return max(xa + (0 if ab == -1 else ab) + xc for xa, ab, xc in states)
`
