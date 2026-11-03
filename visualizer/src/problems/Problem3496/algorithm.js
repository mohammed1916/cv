export const phases = [
  { id: 'start', label: 'Read', description: 'Read the values and set up the window table.' },
  { id: 'window', label: 'Window', description: 'Consider every remaining window of one length.' },
  { id: 'option', label: 'Option', description: 'Score one of the three deletion choices for this window.' },
  { id: 'store', label: 'Store', description: 'Keep the best choice for this window.' },
  { id: 'done', label: 'Result', description: 'Return the best score for the whole array.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input) || input.length < 1 || input.length > 10) throw new Error('Use an array of 1 to 10 integers.')
  if (!input.every(v => Number.isInteger(v) && v >= -9 && v <= 9)) throw new Error('Each value is an integer from -9 to 9.')
  return input.slice()
}

export const code = [
  'maximize score after pair deletions',
  '  dp[l][r] = 0 for every window of at most two values',
  '  for each window length from 3 to n',
  '    for each start l with end r = l + length - 1',
  '      first: sum(l, l+1) + dp[l+2][r]',
  '      last: sum(r-1, r) + dp[l][r-2]',
  '      ends: sum(l, r) + dp[l+1][r-1]',
  '      dp[l][r] = max of the three',
  '  return dp[0][n-1]',
].map((text, index) => ({ line: index + 1, text }))

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export function buildTrace(nums) {
  const n = nums.length
  const prefix = [0]
  for (const x of nums) prefix.push(prefix[prefix.length - 1] + x)
  const sumOf = (l, r) => prefix[r + 1] - prefix[l]
  const dp = Array.from({ length: n }, () => Array(n).fill(null))
  for (let l = 0; l < n; l++) for (let r = l; r < Math.min(n, l + 2); r++) dp[l][r] = 0
  const frames = []
  const snap = () => dp.map(row => row.slice())
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, nums, dp: snap(), l: -1, r: -1, options: null, chosen: null, ...extra,
  })
  push('start', L('maximize score'), P('def max_pair'), `Read ${n} values. Windows of one or two values score 0.`)
  for (let length = 3; length <= n; length++) {
    for (let l = 0; l + length - 1 < n; l++) {
      const r = l + length - 1
      push('window', L('for each start l'), P('for l in range'), `Window nums[${l}..${r}] (length ${length}).`, { l, r })
      const first = sumOf(l, l + 1) + dp[l + 2][r]
      const last = sumOf(r - 1, r) + dp[l][r - 2]
      const ends = sumOf(l, l) + sumOf(r, r) + dp[l + 1][r - 1]
      const options = { first, last, ends }
      push('option', L('first: sum'), P('first = window'), `Remove the first two: ${sumOf(l, l + 1)} + best of the rest ${dp[l + 2][r]} = ${first}.`, { l, r, options })
      push('option', L('last: sum'), P('last = window'), `Remove the last two: ${sumOf(r - 1, r)} + best of the rest ${dp[l][r - 2]} = ${last}.`, { l, r, options })
      push('option', L('ends: sum'), P('ends = window'), `Remove both ends: ${sumOf(l, l) + sumOf(r, r)} + best of the middle ${dp[l + 1][r - 1]} = ${ends}.`, { l, r, options })
      const best = Math.max(first, last, ends)
      dp[l][r] = best
      const chosen = best === first ? 'first' : best === last ? 'last' : 'ends'
      push('store', L('dp[l][r] = max'), P('dp[l][r] = max'), `Keep ${best} for nums[${l}..${r}] (${chosen} pair).`, { l, r, options, chosen })
    }
  }
  const result = n === 0 ? 0 : dp[0][n - 1]
  push('done', L('return dp[0][n-1]'), P('return dp'), `The best total score is ${result}.`, { result })
  return { input: nums, result, frames }
}

export const python = `def max_pair_score(nums):
    n = len(nums)
    prefix = [0]
    for x in nums:
        prefix.append(prefix[-1] + x)

    def window(l, r):
        return prefix[r + 1] - prefix[l]

    dp = [[0] * n for _ in range(n)]
    for length in range(3, n + 1):
        for l in range(0, n - length + 1):
            r = l + length - 1
            first = window(l, l + 1) + dp[l + 2][r]
            last = window(r - 1, r) + dp[l][r - 2]
            ends = window(l, l) + window(r, r) + dp[l + 1][r - 1]
            dp[l][r] = max(first, last, ends)
    return dp[0][n - 1]
`
