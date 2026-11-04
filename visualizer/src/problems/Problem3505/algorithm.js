const MAX_N = 13

export const phases = [
  { id: 'start', label: 'Start', description: 'The window and both halves are empty.' },
  { id: 'add', label: 'Add', description: 'The next value enters one of the two halves.' },
  { id: 'evict', label: 'Evict', description: 'The value that left the window is removed.' },
  { id: 'balance', label: 'Balance', description: 'A value crosses over so the halves stay level.' },
  { id: 'cost', label: 'Cost', description: 'Price this window using the median and the two sums.' },
  { id: 'base', label: 'Base', description: 'Choosing no windows costs nothing.' },
  { id: 'fill', label: 'Fill', description: 'Skip position i, or end a window there.' },
  { id: 'done', label: 'Result', description: 'Read the answer and the windows behind it.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums, x and k.')
  const { nums, x, k } = input
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > MAX_N) throw new Error(`nums has 2 to ${MAX_N} entries.`)
  for (const value of nums) if (!Number.isInteger(value) || Math.abs(value) > 1e6) throw new Error('Each entry of nums is an integer from -1000000 to 1000000.')
  if (!Number.isInteger(x) || x < 2 || x > nums.length) throw new Error('x is an integer from 2 to the length of nums.')
  if (!Number.isInteger(k) || k < 1) throw new Error('k is a positive integer.')
  if (k * x > nums.length) throw new Error('k windows of size x must fit: k * x is at most the length of nums.')
  return { nums, x, k }
}

const insertSorted = (list, value) => {
  let at = list.length
  while (at > 0 && list[at - 1] > value) at--
  list.splice(at, 0, value)
}

export function buildTrace({ nums, x, k }) {
  const n = nums.length
  const frames = []
  const low = []
  const high = []
  let sumLow = 0
  let sumHigh = 0
  const cost = []
  const medians = []
  const windowFrame = r => ({ stage: 'window', r, l: Math.max(0, r - x + 1), low: [...low], high: [...high], sumLow, sumHigh, cost: [...cost], median: null, price: null })
  const push = (phase, pseudo, py, message, state) => frames.push({ phase, activeLine: L(pseudo), pythonLine: P(py), message, ...state })

  push('start', 'keep two sorted halves', 'low, high = [], []', 'Both halves are empty. The last value of low will be the median of the window.', windowFrame(-1))
  for (let r = 0; r < n; r++) {
    const value = nums[r]
    if (low.length === 0 || value <= low[low.length - 1]) {
      insertSorted(low, value)
      sumLow += value
      push('add', 'put the new value', 'insort(low, value)', `${value} is not above the top of low, so it joins the lower half.`, windowFrame(r))
    } else {
      insertSorted(high, value)
      sumHigh += value
      push('add', 'put the new value', 'insort(high, value)', `${value} is above the top of low, so it joins the upper half.`, windowFrame(r))
    }
    if (r >= x) {
      const old = nums[r - x]
      if (old <= low[low.length - 1]) {
        low.splice(low.indexOf(old), 1)
        sumLow -= old
        push('evict', 'remove the value that slid out', 'low.remove(old)', `Index ${r - x} left the window; remove ${old} from the lower half.`, windowFrame(r))
      } else {
        high.splice(high.indexOf(old), 1)
        sumHigh -= old
        push('evict', 'remove the value that slid out', 'high.remove(old)', `Index ${r - x} left the window; remove ${old} from the upper half.`, windowFrame(r))
      }
    }
    while (low.length > high.length + 1) {
      const moved = low.pop()
      high.unshift(moved)
      sumLow -= moved
      sumHigh += moved
      push('balance', 'move values across', 'moved = low.pop()', `The lower half is too big; ${moved} crosses up.`, windowFrame(r))
    }
    while (low.length < high.length) {
      const moved = high.shift()
      low.push(moved)
      sumHigh -= moved
      sumLow += moved
      push('balance', 'move values across', 'moved = high.pop(0)', `The upper half is too big; ${moved} crosses down.`, windowFrame(r))
    }
    if (r >= x - 1) {
      const median = low[low.length - 1]
      const raise = median * low.length - sumLow
      const lower = sumHigh - median * high.length
      cost.push(raise + lower)
      medians.push(median)
      push('cost', 'the window costs', 'cost.append(', `Window [${r - x + 1}..${r}] has median ${median}. Raising the lower half takes ${raise}, lowering the upper half takes ${lower}, total ${raise + lower}.`, { ...windowFrame(r), median, price: { raise, lower, total: raise + lower } })
    }
  }

  const dp = Array.from({ length: k + 1 }, () => Array(n + 1).fill(Infinity))
  dp[0].fill(0)
  const dpFrame = (target, sources, start, why) => ({
    stage: 'dp', r: -1, l: -1, low: [], high: [], sumLow: 0, sumHigh: 0, cost: [...cost], median: null, price: null,
    values: dp.map(row => [...row]), target, sources, start, why,
  })
  push('base', 'choosing 0 windows costs 0', 'dp[0] = [0] * (n + 1)', 'Choosing zero windows costs nothing, however long the prefix is.', dpFrame([0, 0], [], -1, 'Choosing zero windows needs no operations.'))
  for (let j = 1; j <= k; j++) {
    for (let i = j * x; i <= n; i++) {
      const skip = dp[j][i - 1]
      const take = dp[j - 1][i - x] + cost[i - x]
      const takeWins = take < skip
      dp[j][i] = Math.min(skip, take)
      push('fill', 'dp[j][i] is the smaller of', 'dp[j][i] = min(dp[j][i - 1], dp[j - 1][i - x] + cost[i - x])',
        `With ${j} window${j === 1 ? '' : 's'} in the first ${i} values: skip gives ${skip === Infinity ? '∞' : skip}, ending a window at index ${i - 1} gives ${dp[j - 1][i - x]} + ${cost[i - x]} = ${take}. Keep ${dp[j][i]}.`,
        dpFrame([j, i], [
          { cell: [j, i - 1], note: 'skip index ' + (i - 1), chosen: !takeWins },
          { cell: [j - 1, i - x], note: `window [${i - x}..${i - 1}] costs ${cost[i - x]}`, chosen: takeWins },
        ], i - x, takeWins ? 'Ending a window here beats leaving this position out.' : 'Leaving this position out is at least as cheap.'))
    }
  }

  const chosen = []
  for (let j = k, i = n; j > 0;) {
    if (dp[j][i - 1] === dp[j][i]) i -= 1
    else {
      chosen.unshift({ start: i - x, end: i - 1, median: medians[i - x], cost: cost[i - x] })
      i -= x
      j -= 1
    }
  }
  const result = dp[k][n]
  push('done', 'the answer is dp[k][n]', 'return dp[k][n]', `Answer ${result}, from ${chosen.map(w => `window [${w.start}..${w.end}] set to ${w.median}`).join(' and ')}.`, { ...dpFrame([k, n], [], -1, 'The bottom-right cell allows every position and exactly k windows.'), chosen })
  return { input: { nums, x, k }, result, frames }
}

export const code = `fewest operations for k separate windows of size x
  keep two sorted halves of the window, with their sums
  for each index r, sliding the window right
    put the new value in the matching half
    remove the value that slid out of the window
    move values across until the lower half has the extra one
    the window costs: median*|low| - sum(low) + sum(high) - median*|high|
  choosing 0 windows costs 0 for every prefix
  for j windows and each prefix length i
    dp[j][i] is the smaller of dp[j][i-1] and dp[j-1][i-x] + cost[i-x]
  the answer is dp[k][n]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}

export const python = `from bisect import insort


def min_operations(nums, x, k):
    n = len(nums)
    low, high = [], []
    sum_low = sum_high = 0
    cost = []
    for r, value in enumerate(nums):
        if not low or value <= low[-1]:
            insort(low, value)
            sum_low += value
        else:
            insort(high, value)
            sum_high += value
        if r >= x:
            old = nums[r - x]
            if old <= low[-1]:
                low.remove(old)
                sum_low -= old
            else:
                high.remove(old)
                sum_high -= old
        while len(low) > len(high) + 1:
            moved = low.pop()
            high.insert(0, moved)
            sum_low -= moved
            sum_high += moved
        while len(low) < len(high):
            moved = high.pop(0)
            low.append(moved)
            sum_high -= moved
            sum_low += moved
        if r >= x - 1:
            median = low[-1]
            cost.append(median * len(low) - sum_low + sum_high - median * len(high))
    dp = [[float("inf")] * (n + 1) for _ in range(k + 1)]
    dp[0] = [0] * (n + 1)
    for j in range(1, k + 1):
        for i in range(j * x, n + 1):
            dp[j][i] = min(dp[j][i - 1], dp[j - 1][i - x] + cost[i - x])
    return dp[k][n]
`
const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Python line missing: ${s}`)
  return index + 1
}
