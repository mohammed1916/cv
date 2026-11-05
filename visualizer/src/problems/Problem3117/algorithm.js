export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.nums) || !Array.isArray(data.and_values)) throw new Error('Use an object with arrays nums and and_values.')
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
  const frames = [{ pythonLine: PL("cost = [0]"), phase: 'start', activeLine: L('const m = andValues.length'), piece: 0, left: -1, right: -1, value: null, costs: previous.slice(), result: null, message: 'Nothing is split yet: the cost of an empty prefix is 0.' }]
  for (let j = 1; j <= m; j++) {
    const next = Array.from({ length: n + 1 }, () => INF)
    for (let i = 1; i <= n; i++) {
      let running = -1
      for (let l = i - 1; l >= 0; l--) {
        running &= nums[l]
        if (running === and_values[j - 1] && previous[l] < INF) {
          const candidate = previous[l] + nums[i - 1]
          frames.push({ pythonLine: PL('if running == and_values'), phase: 'candidate', activeLine: L('if (running === andValues[j - 1]'), piece: j, left: l, right: i - 1, value: running, costs: previous.slice(), result: null, message: `nums[${l}..${i - 1}] ANDs to ${running}, which is piece ${j}'s target, so it can end a piece with cost ${candidate}.` })
          next[i] = Math.min(next[i], candidate)
        }
      }
    }
    previous = next
    frames.push({ pythonLine: PL('cost = nxt'), phase: 'piece', activeLine: L('next[i] = Math.min'), piece: j, left: -1, right: -1, value: null, costs: previous.slice(), result: null, message: `Piece ${j} must end at a position with a matching AND. Cheapest costs so far: ${previous.map(v => (v === INF ? '-' : v)).join(', ')}.` })
  }
  const result = previous[n] === INF ? -1 : previous[n]
  frames.push({ pythonLine: PL('return -1 if'), phase: 'done', activeLine: L('return previous[n] === Infinity'), piece: m, left: -1, right: -1, value: null, costs: previous.slice(), result, message: `Cheapest split: ${result}.` })
  return { input, result, frames }
}

export const code = `function minSumOfValues(nums, andValues) {
  const n = nums.length
  const m = andValues.length
  let previous = Array(n + 1).fill(Infinity)
  previous[0] = 0
  for (let j = 1; j <= m; j++) {
    const next = Array(n + 1).fill(Infinity)
    for (let i = 1; i <= n; i++) {
      let running = -1
      for (let l = i - 1; l >= 0; l--) {
        running &= nums[l]
        if (running === andValues[j - 1] && previous[l] < Infinity) {
          next[i] = Math.min(next[i], previous[l] + nums[i - 1])
        }
      }
    }
    previous = next
  }
  return previous[n] === Infinity ? -1 : previous[n]
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error('No code line: ' + s); return i + 1 }

export const python = `def min_sum_of_values(nums, and_values):
    n = len(nums)
    m = len(and_values)
    INF = float('inf')
    cost = [0] + [INF] * n
    for j in range(1, m + 1):
        nxt = [INF] * (n + 1)
        for i in range(1, n + 1):
            running = -1
            for l in range(i - 1, -1, -1):
                running &= nums[l]
                if running == and_values[j - 1] and cost[l] < INF:
                    nxt[i] = min(nxt[i], cost[l] + nums[i - 1])
        cost = nxt
    return -1 if cost[n] == INF else cost[n]`
const PY_LINES = python.split('\n')
const PL = s => { const i = PY_LINES.findIndex(line => line.includes(s)); if (i < 0) throw new Error('No python line: ' + s); return i + 1 }
