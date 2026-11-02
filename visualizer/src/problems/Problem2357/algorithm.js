export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 24) throw new Error('nums has 1 to 24 entries.')
  if (!nums.every(x => Number.isInteger(x) && x >= 0 && x <= 100)) throw new Error('Each entry is an integer from 0 to 100.')
  return { nums }
}

export function buildTrace({ nums }) {
  const seen = new Set()
  const frames = []
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('empty set'), at: -1, seen: [], result: null, message: `Scan ${nums.length} entries for distinct positive values.` })
  for (let i = 0; i < nums.length; i++) {
    const x = nums[i]
    if (x > 0) {
      const fresh = !seen.has(x)
      seen.add(x)
      frames.push({ pythonLine: 5, phase: fresh ? 'new' : 'repeat', activeLine: L('add x'), at: i, seen: [...seen], result: null, message: fresh ? `${x} is a new distinct positive value.` : `${x} was already counted.` })
    } else {
      frames.push({ pythonLine: 4, phase: 'skip', activeLine: L('if x > 0'), at: i, seen: [...seen], result: null, message: `${x} is zero and needs no operation.` })
    }
  }
  frames.push({ pythonLine: 6, phase: 'done', activeLine: L('return'), at: -1, seen: [...seen], result: seen.size, message: `${seen.size} operation${seen.size === 1 ? '' : 's'} clear the array.` })
  return { input: { nums }, result: seen.size, frames }
}

export const code = `minimum operations to make every entry zero
  seen = empty set
  for each x in nums
    if x is positive then add x to seen
  return the size of seen`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_operations(nums):
    seen = set()
    for x in nums:
        if x > 0:
            seen.add(x)
    return len(seen)
`
