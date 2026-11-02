const PL = s => python.split('\n').findIndex(line => line.trim() === s) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and x.')
  const { nums, x } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12 || !nums.every(v => Number.isInteger(v) && v >= 1 && v <= 1000)) throw new Error('nums has 1 to 12 integers from 1 to 1000.')
  if (!Number.isInteger(x) || x < 1 || x > 1000) throw new Error('x is an integer from 1 to 1000.')
  return { nums, x }
}

export function buildTrace({ nums, x }) {
  const n = nums.length
  const frames = []
  let best = [...nums]
  let answer = best.reduce((a, b) => a + b, 0)
  frames.push({ pythonLine: PL('best = list(nums)'), phase: 'start', activeLine: L('best[i] = nums[i]'), k: 0, best: [...best], cost: answer, answer, message: `Without any rotation, buying the cheapest copy of each type costs ${answer}.` })
  for (let k = 1; k < n; k++) {
    best = best.map((value, i) => Math.min(value, nums[(((i - k) % n) + n) % n]))
    frames.push({ pythonLine: PL('best[i] = min(best[i], nums[(i - k) % n])'), phase: 'shift', activeLine: L('for each type i'), k, best: [...best], cost: null, answer, message: `After ${k} rotation${k === 1 ? '' : 's'}, each type can be bought at its cheapest reachable cost.` })
    const cost = k * x + best.reduce((a, b) => a + b, 0)
    if (cost < answer) answer = cost
    frames.push({ pythonLine: PL('answer = min(answer, k * x + sum(best))'), phase: 'cost', activeLine: L('answer is the cheaper'), k, best: [...best], cost, answer, message: `${k} rotation${k === 1 ? '' : 's'} cost ${k * x}, so the total is ${cost}.` })
  }
  frames.push({ pythonLine: PL('return answer'), phase: 'done', activeLine: L('return the lowest'), k: -1, best: [...best], cost: null, answer, result: answer, message: `The cheapest total is ${answer}.` })
  return { input: { nums, x }, result: answer, frames }
}

export const code = `minimum cost to collect one chocolate of every type
  best[i] = nums[i] for each type i
  answer = sum of best
  for k from 1 to n minus 1
    for each type i
      best[i] = the smaller of best[i] and nums[(i minus k) mod n]
    answer is the cheaper of answer and k times x plus sum of best
  return the lowest answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_cost_collect(nums, x):
    n = len(nums)
    best = list(nums)
    answer = sum(best)
    for k in range(1, n):
        for i in range(n):
            best[i] = min(best[i], nums[(i - k) % n])
        answer = min(answer, k * x + sum(best))
    return answer
`
