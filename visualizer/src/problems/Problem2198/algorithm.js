const L = s => {
  const line = code.findIndex(c => c.text.includes(s)) + 1
  if (line < 1) throw new Error(`Missing pseudocode line: ${s}`)
  return line
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 3 || nums.length > 10 || !nums.every(v => Number.isInteger(v) && v >= 1 && v <= 30)) {
    throw new Error('nums has 3 to 10 integers from 1 to 30.')
  }
  return { nums }
}

export function buildTrace({ nums }) {
  const n = nums.length
  const frames = []
  let answer = 0
  let singles = 0
  frames.push({ pythonLine: 3, phase: 'start', activeLine: L('answer = 0'), indices: null, values: null, total: null, hits: null, singles, answer, message: `Start with an answer of 0 for ${n} values.` })
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (let k = j + 1; k < n; k++) {
        const values = [nums[i], nums[j], nums[k]]
        const total = values[0] + values[1] + values[2]
        const hitFlags = values.map(v => total % v === 0)
        const hits = hitFlags.filter(Boolean).length
        const indices = [i, j, k]
        frames.push({ pythonLine: 7, phase: 'triple', activeLine: L('for each i < j < k'), indices, values, total, hitFlags: null, hits: null, singles, answer, message: `Triple (${i}, ${j}, ${k}) with values ${values.join(', ')}: the sum is ${total}.` })
        frames.push({ pythonLine: 8, phase: 'check', activeLine: L('how many'), indices, values, total, hitFlags, hits, singles, answer, message: `${total} is divisible by ${hits} of the three values.` })
        if (hits === 1) {
          singles++
          answer += 6
          frames.push({ pythonLine: 10, phase: 'count', activeLine: L('add 6 to answer'), indices, values, total, hitFlags, hits, singles, answer, message: `Exactly one divides ${total}. The six orderings add 6, so the answer is now ${answer}.` })
        } else {
          frames.push({ pythonLine: 9, phase: 'skip', activeLine: L('if hits is exactly 1'), indices, values, total, hitFlags, hits, singles, answer, message: `Not a single divisor triple, so nothing is added.` })
        }
      }
    }
  }
  frames.push({ pythonLine: 11, phase: 'done', activeLine: L('return answer'), indices: null, values: null, total: null, hits: null, singles, answer, message: `All triples are checked. ${singles} unordered triple${singles === 1 ? '' : 's'} qualify, so the answer is ${answer}.` })
  return { input: { nums }, result: answer, frames }
}

export const code = `count ordered triples of distinct indices with exactly one divisor hit
answer = 0
for each i < j < k as an unordered index triple
  total = nums[i] + nums[j] + nums[k]
  hits = how many of the three values divide total
  if hits is exactly 1 then add 6 to answer for the six orderings
return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def count_single_divisor_triplets(nums):
    n = len(nums)
    answer = 0
    for i in range(n):
        for j in range(i + 1, n):
            for k in range(j + 1, n):
                total = nums[i] + nums[j] + nums[k]
                hits = (total % nums[i] == 0) + (total % nums[j] == 0) + (total % nums[k] == 0)
                if hits == 1:
                    answer += 6
    return answer
`
