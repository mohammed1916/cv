export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.nums) || !Array.isArray(data.and_values)) throw new Error('Use an object with arrays nums and and_values, for example {"nums":[1,4,3,3,2],"and_values":[0,3,3,2]}.')
  const n = data.nums.length
  const m = data.and_values.length
  if (n < 1 || n > 10) throw new Error('nums must have 1 to 10 entries.')
  if (m < 1 || m > Math.min(n, 10)) throw new Error('and_values must have 1 to min(n, 10) entries.')
  const ok = v => Number.isInteger(v) && v >= 0 && v <= 63
  if (!data.nums.every(ok) || !data.and_values.every(ok)) throw new Error('Values must be integers from 0 to 63.')
  return { nums: data.nums, and_values: data.and_values }
}

export function buildTrace(input) {
  const { nums, and_values } = input
  const n = nums.length
  const m = and_values.length
  const INF = Infinity
  let previous = Array.from({ length: n + 1 }, (_, i) => (i === 0 ? 0 : INF))
  const frames = [{ phase: 'start', activeLine: L('let m be the length'), piece: 0, costs: previous.slice(), result: null, message: 'Nothing is split yet. Cost 0 covers an empty prefix.' }]
  for (let j = 1; j <= m; j++) {
    const next = Array.from({ length: n + 1 }, () => INF)
    for (let i = 1; i <= n; i++) {
      let running = -1
      for (let l = i - 1; l >= 0; l--) {
        running &= nums[l]
        if (running === and_values[j - 1] && previous[l] < INF) next[i] = Math.min(next[i], previous[l] + nums[i - 1])
      }
    }
    previous = next
    frames.push({ phase: 'piece', activeLine: L('set cost[j][i] to'), piece: j, costs: previous.slice(), result: null, message: `Piece ${j} must have AND ${and_values[j - 1]}. Cheapest costs for each prefix ending: ${previous.map(v => (v === INF ? '-' : v)).join(', ')}.` })
  }
  const result = previous[n] === INF ? -1 : previous[n]
  frames.push({ phase: 'done', activeLine: L('return cost[m][n]'), piece: m, costs: previous.slice(), result, message: `Cheapest split: ${result}.` })
  return { input, result, frames }
}

export const code = `minimum sum of values (nums, and_values)
  let m be the length of and_values
  set cost[0][0] to 0 and every other cost to infinity
  for each piece j from 1 to m
    for each end position i from 1 to n
      set running to all ones (-1)
      for each start position l from i minus 1 down to 0
        set running to running AND nums[l]
        if running equals and_values[j minus 1] and cost[j minus 1][l] is finite then
          set cost[j][i] to the smaller of cost[j][i] and cost[j minus 1][l] plus nums[i minus 1]
  if cost[m][n] is infinite then
    return -1
  return cost[m][n]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_sum_of_values(nums, and_values):
    n = len(nums)
    m = len(and_values)
    INF = float('inf')
    cost = [[INF] * (n + 1) for _ in range(m + 1)]
    cost[0][0] = 0
    for j in range(1, m + 1):
        for i in range(1, n + 1):
            running = -1
            for l in range(i - 1, -1, -1):
                running &= nums[l]
                if running == and_values[j - 1] and cost[j - 1][l] < INF:
                    cost[j][i] = min(cost[j][i], cost[j - 1][l] + nums[i - 1])
    return -1 if cost[m][n] == INF else cost[m][n]
`
