export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 50) throw new Error('nums has 1 to 50 integers.')
  if (!nums.every(x => Number.isInteger(x) && x >= 1 && x <= 1000)) throw new Error('Each num is an integer from 1 to 1000.')
  return { nums }
}

export function buildTrace({ nums }) {
  const frames = []
  let total = 0
  let count = 0
  frames.push({ pythonLine: PL('total = 0'), phase: 'setup', activeLine: CL('let total = 0'), at: -1, total, count, message: 'Start with an empty sum and no matches.' })
  nums.forEach((x, i) => {
    frames.push({ pythonLine: PL('for x in nums'), phase: 'scan', activeLine: CL('for (const x of nums)'), at: i, total, count, message: `Look at ${x}.` })
    const hit = x % 6 === 0
    frames.push({ pythonLine: PL('if x % 6 == 0'), phase: 'check', activeLine: CL('if (x % 6 === 0)'), at: i, total, count, message: `${x} is ${hit ? 'even and divisible by 3' : 'not both even and divisible by 3'}.` })
    if (hit) {
      total += x
      count += 1
      frames.push({ pythonLine: PL('total += x'), phase: 'add', activeLine: CL('total += x'), at: i, total, count, message: `Add ${x}; sum ${total}, count ${count}.` })
    }
  })
  const result = count === 0 ? 0 : Math.floor(total / count)
  frames.push({ pythonLine: count === 0 ? PL('return 0') : PL('return total // count'), phase: 'done', activeLine: CL(count === 0 ? 'if (count === 0)' : 'return Math.floor'), at: -1, total, count, message: count === 0 ? 'No such numbers, so the answer is 0.' : `Floor of ${total} / ${count} is ${result}.` })
  return { input: { nums }, result, frames }
}

export const code = `function averageValue(nums) {
  let total = 0;
  let count = 0;
  for (const x of nums) {
    if (x % 6 === 0) {
      total += x;
      count += 1;
    }
  }
  if (count === 0) return 0;
  return Math.floor(total / count);
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def average_value(nums):
    total = 0
    count = 0
    for x in nums:
        if x % 6 == 0:
            total += x
            count += 1
    if count == 0:
        return 0
    return total // count
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
