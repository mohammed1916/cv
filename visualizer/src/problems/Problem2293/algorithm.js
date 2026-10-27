export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with nums.')
  const { nums } = data
  if (!Array.isArray(nums) || ![1, 2, 4, 8, 16, 32].includes(nums.length)) throw new Error('nums must have a power-of-two length from 1 to 32.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 100)) throw new Error('Each value is an integer from 1 to 100.')
  return { nums }
}

export function buildTrace(input) {
  let current = [...input.nums]
  let round = 0
  const frames = [{ phase: 'start', activeLine: L('set current to nums'), round, values: [...current], message: `Start with ${current.length} values.` }]
  while (current.length > 1) {
    round += 1
    const next = []
    for (let i = 0; i < current.length / 2; i++) {
      const a = current[2 * i]
      const b = current[2 * i + 1]
      next.push(i % 2 === 0 ? Math.min(a, b) : Math.max(a, b))
    }
    current = next
    frames.push({ phase: 'pass', activeLine: L('if i is even'), round, values: [...current],
      message: `Pass ${round}: the new list is ${current.join(', ')}. Even positions take the minimum, odd positions the maximum.` })
  }
  frames.push({ phase: 'done', activeLine: L('return the single value'), round, values: [...current], message: `The single value left is ${current[0]}.` })
  return { input, result: current[0], frames }
}

export const code = `find the min max game result
  set current to nums
  while current has more than one value
    make an empty list next
    for each index i from 0 to half the length of current minus 1
      if i is even then add the minimum of current[2i] and current[2i+1] to next
      otherwise add the maximum of current[2i] and current[2i+1] to next
    set current to next
  return the single value left in current`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_max_game(nums):
    current = list(nums)
    while len(current) > 1:
        nxt = []
        for i in range(len(current) // 2):
            a = current[2 * i]
            b = current[2 * i + 1]
            nxt.append(min(a, b) if i % 2 == 0 else max(a, b))
        current = nxt
    return current[0]
`
