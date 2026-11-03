const PL = s => python.split('\n').findIndex(line => line.trim() === s) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12 || !nums.every(v => Number.isInteger(v) && v >= 0 && v < nums.length)) throw new Error('nums has 1 to 12 integers, each from 0 to len(nums) minus 1.')
  return { nums }
}

export function buildTrace({ nums }) {
  const n = nums.length
  const frames = []
  const count = Array(n + 1).fill(0)
  frames.push({ pythonLine: PL('count = [0] * (n + 1)'), phase: 'start', activeLine: L('count[v] = number'), k: -1, count: [...count], less: 0, ways: 0, message: 'Count how many students have each value.' })
  for (const x of nums) {
    count[x] += 1
    frames.push({ pythonLine: PL('count[x] += 1'), phase: 'count', activeLine: L('count[v] = number'), k: -1, count: [...count], less: 0, ways: 0, message: `A student with value ${x} is counted.` })
  }
  let ways = 0
  let less = 0
  for (let k = 0; k <= n; k++) {
    const valid = less === k && count[k] === 0
    frames.push({ pythonLine: PL('if less == k and count[k] == 0:'), phase: 'check', activeLine: L('if less is k'), k, count: [...count], less, ways, valid, message: `Group size ${k}: ${less} students have a value below ${k}, and ${count[k]} have exactly ${k}. ${valid ? 'Valid.' : 'Invalid.'}` })
    if (valid) {
      ways += 1
      frames.push({ pythonLine: PL('ways += 1'), phase: 'check', activeLine: L('add one way'), k, count: [...count], less, ways, valid, message: `Size ${k} is one way to make everyone happy.` })
    }
    less += count[k]
  }
  frames.push({ pythonLine: PL('return ways'), phase: 'done', activeLine: L('return ways'), k: -1, count: [...count], less, ways, result: ways, message: `There ${ways === 1 ? 'is 1 way' : `are ${ways} ways`}.` })
  return { input: { nums }, result: ways, frames }
}

export const code = `count the ways to choose a happy group
  count[v] = number of students whose value is v, for v from 0 to n
  ways = 0 and less = 0
  for each group size k from 0 to n
    if less is k and count[k] is zero, add one way
    less = less plus count[k]
  return ways`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_happy_groups(nums):
    n = len(nums)
    count = [0] * (n + 1)
    for x in nums:
        count[x] += 1
    ways = 0
    less = 0
    for k in range(n + 1):
        if less == k and count[k] == 0:
            ways += 1
        less += count[k]
    return ways
`
