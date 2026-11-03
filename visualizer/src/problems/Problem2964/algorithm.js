export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and d.')
  const { nums, d } = input
  if (!Array.isArray(nums) || nums.length < 3 || nums.length > 10) throw new Error('nums has 3 to 10 entries.')
  if (!nums.every(v => Number.isInteger(v) && v >= 0 && v <= 20)) throw new Error('Each number is an integer from 0 to 20.')
  if (!Number.isInteger(d) || d < 1 || d > 10) throw new Error('d is an integer from 1 to 10.')
  return { nums, d }
}

// ways[t][r] counts the chosen subsequences of size t (so far) whose sum leaves remainder r modulo d.
// Each number is either skipped or appended to a smaller subsequence; sizes go down so one number is used once.
export function buildTrace({ nums, d }) {
  const frames = []
  const ways = [0, 1, 2, 3].map(() => Array(d).fill(0))
  ways[0][0] = 1
  const snapshot = () => ways.map(row => [...row])
  frames.push({ phase: 'start', pythonLine: 3, activeLine: L('ways[t][r] counts'), index: -1, x: null, ways: snapshot(), message: `Start with the empty subsequence at remainder 0. Divisor d = ${d}.` })
  nums.forEach((x, index) => {
    for (let t = 3; t >= 1; t--) {
      for (let r = 0; r < d; r++) {
        ways[t][(r + x) % d] += ways[t - 1][r]
      }
    }
    frames.push({ phase: 'element', pythonLine: 7, activeLine: L('each residue r moves'), index, x, ways: snapshot(),
      message: `Use nums[${index}] = ${x}: subsequences of size 3 ending in remainder 0 now number ${ways[3][0]}.` })
  })
  const result = ways[3][0]
  frames.push({ phase: 'done', pythonLine: 8, activeLine: L('return ways'), index: -1, x: null, ways: snapshot(), message: `There are ${result} index triples whose sum is divisible by ${d}.` })
  return { input: { nums, d }, result, frames }
}

export const code = `count index triples i < j < k whose sum is divisible by d
  ways[t][r] counts subsequences of size t with remainder r; ways[0][0] is one
  for each number x
    for size t from three down to one
      each residue r moves to residue r plus x, using ways from size t minus one
  return ways[3][0]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def count_divisible_triplets(nums, d):
    ways = [[0] * d for _ in range(4)]
    ways[0][0] = 1
    for x in nums:
        for t in range(3, 0, -1):
            for r in range(d):
                ways[t][(r + x) % d] += ways[t - 1][r]
    return ways[3][0]
`
