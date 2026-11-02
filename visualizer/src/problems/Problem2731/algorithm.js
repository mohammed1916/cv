const PL = s => python.split('\n').findIndex(line => line.trim() === s) + 1
const MOD = 1000000007n

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums, s and d.')
  const { nums, s, d } = input
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 12 || !nums.every(x => Number.isInteger(x) && Math.abs(x) <= 2000000000)) throw new Error('nums has 2 to 12 integers, each within 2e9 in size.')
  if (new Set(nums).size !== nums.length) throw new Error('nums must hold distinct positions.')
  if (typeof s !== 'string' || s.length !== nums.length || !/^[LR]+$/.test(s)) throw new Error('s has one L or R per robot.')
  if (!Number.isInteger(d) || d < 0 || d > 1000000000) throw new Error('d is an integer from 0 to 1e9.')
  return { nums, s, d }
}

export function buildTrace({ nums, s, d }) {
  const frames = []
  const final = []
  frames.push({ pythonLine: PL('final = []'), phase: 'start', activeLine: L('move each robot'), index: -1, positions: [], total: 0, message: `Each robot moves ${d} step${d === 1 ? '' : 's'} in its fixed direction.` })
  nums.forEach((x, i) => {
    const end = s[i] === 'R' ? x + d : x - d
    final.push(end)
    frames.push({ pythonLine: PL('final.append(x + d if c == \'R\' else x - d)'), phase: 'move', activeLine: L('robot i ends'), index: i, positions: [...final], total: 0, message: `Robot ${i} moves ${s[i] === 'R' ? 'right' : 'left'} from ${x} to ${end}.` })
  })
  final.sort((a, b) => a - b)
  frames.push({ pythonLine: PL('final.sort()'), phase: 'sort', activeLine: L('sort the final positions'), index: -1, positions: [...final], total: 0, message: 'Sort the final positions; the order of robots no longer matters.' })
  let total = 0n
  let prefix = 0n
  final.forEach((pos, i) => {
    const p = BigInt(pos)
    total += p * BigInt(i) - prefix
    prefix += p
    frames.push({ pythonLine: PL('total += pos * i - prefix'), phase: 'sum', activeLine: L('add the distances'), index: i, positions: [...final], total: Number(total), message: `Position ${pos} adds ${pos} * ${i} - ${Number(prefix - p)} to the total.` })
  })
  const result = Number(((total % MOD) + MOD) % MOD)
  frames.push({ pythonLine: PL('return total % MOD'), phase: 'done', activeLine: L('return the sum'), index: -1, positions: [...final], total: Number(total), result, message: `The sum of distances modulo 1000000007 is ${result}.` })
  return { input: { nums, s, d }, result, frames }
}

export const code = `sum of pairwise distances after d seconds
  for each robot i
    final position = nums[i] plus d if s[i] is R, else nums[i] minus d
  sort the final positions
  total = 0 and prefix = 0
  for i from 0 to n minus 1
    total = total + position[i] * i minus prefix
    prefix = prefix + position[i]
  return total modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def sum_of_distances(nums, s, d):
    MOD = 10**9 + 7
    final = []
    for x, c in zip(nums, s):
        final.append(x + d if c == 'R' else x - d)
    final.sort()
    total = 0
    prefix = 0
    for i, pos in enumerate(final):
        total += pos * i - prefix
        prefix += pos
    return total % MOD
`
