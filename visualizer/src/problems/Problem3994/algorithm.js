const MOD = 1000000007

export const code = `the minimum adjacent swaps that group values into below a, from a to b, and above b
  set seen counts for the three groups to 0, 0 and 0, and swaps to 0
  for each value in order
    set group to 0 if value is below a, 1 if value is from a to b, otherwise 2
    add to swaps the number of seen values in groups above group
    add one to the seen count for group
  return swaps modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = text => {
  const at = code.findIndex(c => c.text.includes(text))
  if (at < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return at + 1
}

export const python = `def min_adjacent_swaps(nums, a, b):
    MOD = 1_000_000_007
    seen = [0, 0, 0]
    swaps = 0
    for x in nums:
        group = 0 if x < a else (1 if x <= b else 2)
        swaps += sum(seen[group + 1:])
        seen[group] += 1
    return swaps % MOD
`
const pyLines = python.split('\n')
const P = text => {
  const at = pyLines.findIndex(line => line.includes(text))
  if (at < 0) throw new Error(`Missing python line: ${text}`)
  return at + 1
}

export function groupOf(x, a, b) {
  return x < a ? 0 : x <= b ? 1 : 2
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums) || ![input.a, input.b].every(Number.isInteger)) {
    throw new Error('Use an object with nums (array) and integers a and b.')
  }
  const { nums, a, b } = input
  if (nums.length < 1 || nums.length > 10) throw new Error('nums has 1 to 10 values in this visualization.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 20)) throw new Error('Values are integers from 1 to 20.')
  if (!(1 <= a && a < b && b <= 20)) throw new Error('Need 1 <= a < b <= 20.')
  return { nums, a, b }
}

export function buildTrace({ nums, a, b }) {
  const frames = []
  const seen = [0, 0, 0]
  let swaps = 0
  frames.push({ pythonLine: P('seen = [0, 0, 0]'), phase: 'start', activeLine: L('set seen counts'), index: -1, group: null, seen: [...seen], swaps, message: `Groups: below ${a}, ${a} to ${b}, above ${b}.` })
  nums.forEach((x, idx) => {
    const g = groupOf(x, a, b)
    const crossed = seen.slice(g + 1).reduce((s, c) => s + c, 0)
    frames.push({ pythonLine: P('group = 0 if x'), phase: 'classify', activeLine: L('set group to 0 if value'), index: idx, group: g, seen: [...seen], swaps, message: `${x} belongs to group ${g}.` })
    swaps += crossed
    frames.push({ pythonLine: P('swaps += sum'), phase: 'count', activeLine: L('add to swaps the number of seen'), index: idx, group: g, seen: [...seen], swaps, crossed,
      message: crossed ? `${crossed} earlier value${crossed === 1 ? '' : 's'} sit in higher groups and must pass ${x}; swaps rise to ${swaps}.` : `No earlier value sits in a higher group; swaps stay ${swaps}.` })
    seen[g] += 1
    frames.push({ pythonLine: P('seen[group] += 1'), phase: 'record', activeLine: L('add one to the seen count'), index: idx, group: g, seen: [...seen], swaps, message: `Group ${g} now has ${seen[g]} seen.` })
  })
  const result = swaps % MOD
  frames.push({ pythonLine: P('return swaps % MOD'), phase: 'done', activeLine: L('return swaps modulo'), index: -1, group: null, seen: [...seen], swaps, result, message: `Minimum swaps: ${result}.` })
  return { input: { nums, a, b }, result, frames }
}
