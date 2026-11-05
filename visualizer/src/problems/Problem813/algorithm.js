export function parseInput(text) {
  const data = JSON.parse(text)
  const { nums, k } = data ?? {}
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 30 || nums.some(v => !Number.isInteger(v) || v < 0 || v > 100)) throw new Error('nums must be 1–30 integers from 0 to 100.')
  if (!Number.isInteger(k) || k < 1 || k > nums.length) throw new Error('k must be an integer from 1 to the length of nums.')
  return { nums, k }
}

const JS_LINES = [
  'function largestSumOfAverages(nums, k) {',
  '  const n = nums.length',
  '  const pre = [0] // pre[i] = sum of the first i values',
  '  for (const v of nums) pre.push(pre[pre.length - 1] + v)',
  '  const avg = (j, i) => (pre[i] - pre[j]) / (i - j) // average of nums[j..i-1]',
  '  let dp = Array.from({ length: n + 1 }, (_, i) => (i === 0 ? -Infinity : avg(0, i))) // one group',
  '  for (let g = 2; g <= k; g++) {',
  '    const next = Array(n + 1).fill(-Infinity)',
  '    for (let i = g; i <= n; i++) {',
  '      for (let j = g - 1; j < i; j++) next[i] = Math.max(next[i], dp[j] + avg(j, i)) // the last group is nums[j..i-1]',
  '    }',
  '    dp = next',
  '  }',
  '  return dp[n] // return the best total with exactly k groups',
  '}',
]
const PY_LINES = [
  'def largest_sum_of_averages(nums, k):',
  '    n = len(nums)',
  '    pre = [0]',
  '    for v in nums:',
  '        pre.append(pre[-1] + v)',
  '    def avg(j, i):',
  '        return (pre[i] - pre[j]) / (i - j)',
  '    dp = [float(\'-inf\')] + [avg(0, i) for i in range(1, n + 1)]',
  '    for g in range(2, k + 1):',
  '        nxt = [float(\'-inf\')] * (n + 1)',
  '        for i in range(g, n + 1):',
  '            for j in range(g - 1, i):',
  '                nxt[i] = max(nxt[i], dp[j] + avg(j, i))',
  '        dp = nxt',
  '    return dp[n]',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// dp[i] after g groups is the best total for the first i values. The last group starts at some j and ends at i.
export function buildTrace({ nums, k }) {
  const n = nums.length
  const pre = [0]
  for (const v of nums) pre.push(pre[pre.length - 1] + v)
  const avg = (j, i) => (pre[i] - pre[j]) / (i - j)
  let dp = Array.from({ length: n + 1 }, (_, i) => (i === 0 ? -Infinity : avg(0, i)))
  const table = [dp.slice()]
  const frames = [{ phase: 'start', g: 1, i: null, table: table.map(r => r.map(v => (Number.isFinite(v) ? Number(v.toFixed(3)) : '–'))), activeLine: L('let dp'), pythonLine: P('dp = [float'), message: 'One group: the average of the first i values.' }]
  for (let g = 2; g <= k; g++) {
    const next = Array(n + 1).fill(-Infinity)
    for (let i = g; i <= n; i++) {
      let bestJ = -1
      for (let j = g - 1; j < i; j++) {
        const total = dp[j] + avg(j, i)
        if (total > next[i]) { next[i] = total; bestJ = j }
      }
      frames.push({ phase: 'cell', g, i, cut: bestJ, table: [...table, next.slice()].map(r => r.map(v => (Number.isFinite(v) ? Number(v.toFixed(3)) : '–'))), activeLine: L('next[i] = Math.max'), pythonLine: P('nxt[i] = max'),
        message: `${g} groups over the first ${i} values: the last group starts at ${bestJ} and gives ${Number(next[i].toFixed(3))}.` })
    }
    dp = next
    table.push(dp.slice())
  }
  const result = dp[n]
  frames.push({ phase: 'done', g: k, i: n, table: table.map(r => r.map(v => (Number.isFinite(v) ? Number(v.toFixed(3)) : '–'))), result, activeLine: L('return dp[n]'), pythonLine: P('return dp[n]'), message: `Largest sum of averages with ${k} group${k === 1 ? '' : 's'}: ${Number(result.toFixed(3))}.` })
  return { input: { nums, k }, result, frames }
}
