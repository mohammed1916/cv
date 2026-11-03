export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and queries.')
  const { nums, queries } = input
  if (!Array.isArray(nums) || nums.length < 3 || nums.length > 14) throw new Error('nums has 3 to 14 values.')
  if (!nums.every(v => Number.isInteger(v) && v >= 0 && v <= 100000)) throw new Error('Each value is an integer from 0 to 100000.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 10) throw new Error('queries has 1 to 10 entries.')
  const n = nums.length
  for (const q of queries) {
    if (!Array.isArray(q) || q.length !== 3) throw new Error('Each query is [type, a, b].')
    const [type, a, b] = q
    if (type === 1) {
      if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b >= n || a >= b) throw new Error('A type 1 query needs 0 <= l < r < n.')
    } else if (type === 2) {
      if (!Number.isInteger(a) || a < 0 || a >= n || !Number.isInteger(b) || b < 0 || b > 100000) throw new Error('A type 2 query needs a valid index and a value from 0 to 100000.')
    } else {
      throw new Error('The query type is 1 or 2.')
    }
  }
  return { nums, queries }
}

const lineOf = (list, text) => {
  const i = list.findIndex(c => c.text.includes(text))
  if (i < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return i + 1
}

const isPeak = (nums, i) => i >= 1 && i <= nums.length - 2 && nums[i - 1] < nums[i] && nums[i] > nums[i + 1]

export function buildTrace({ nums: initial, queries }) {
  const frames = []
  const L = t => lineOf(code, t)
  const P = t => lineOf(PY, t)
  const nums = [...initial]
  const peak = nums.map((_, i) => isPeak(nums, i))
  const answers = []
  const snap = extra => ({ nums: [...nums], peak: [...peak], answers: [...answers], ...extra })
  frames.push(snap({ phase: 'start', activeLine: L('keep a peak flag'), pythonLine: P('peak = [is_peak'), queryIndex: -1, left: -1, right: -1, x: -1, nearest: -1, count: null, message: `Start with ${peak.filter(Boolean).length} peak${peak.filter(Boolean).length === 1 ? '' : 's'} marked.` }))

  queries.forEach((query, qi) => {
    const [type, a, b] = query
    if (type === 2) {
      nums[a] = b
      frames.push(snap({ phase: 'update', activeLine: L('set nums[index] to value'), pythonLine: P('nums[i] = v'), queryIndex: qi, left: -1, right: -1, x: -1, nearest: -1, count: null, changed: a, message: `Query ${qi + 1}: set position ${a} to ${b}.` }))
      for (const j of [a - 1, a, a + 1]) {
        if (j < 0 || j >= nums.length) continue
        peak[j] = isPeak(nums, j)
      }
      frames.push(snap({ phase: 'refresh', activeLine: L('refresh the peak flags'), pythonLine: P('peak[j] = is_peak(j)'), queryIndex: qi, left: -1, right: -1, x: -1, nearest: -1, count: null, changed: a, message: `Peak flags near ${a} are recomputed from the neighbours.` }))
      return
    }
    const l = a
    const r = b
    let count = 0
    let nearest = -1
    frames.push(snap({ phase: 'scan', activeLine: L('walk x from r minus 1'), pythonLine: P('for x in range(r - 1'), queryIndex: qi, left: l, right: r, x: r - 1, nearest, count: 0, message: `Query ${qi + 1}: count subarrays inside ${l}..${r} that contain a peak.` }))
    for (let x = r - 1; x >= l; x--) {
      if (x + 1 < r && peak[x + 1]) nearest = x + 1
      if (nearest >= 0) count += r - nearest
      frames.push(snap({ phase: 'scan', activeLine: L('if a peak lies strictly right'), pythonLine: P('if x + 1 < r and peak[x + 1]'), queryIndex: qi, left: l, right: r, x, nearest, count, message: nearest >= 0 ? `Start ${x}: nearest peak ${nearest}, so ${r - nearest} subarrays end in ${nearest + 1}..${r}. Running count ${count}.` : `Start ${x}: no peak strictly inside ${x + 1}..${r - 1}, so nothing is added.` }))
    }
    answers.push(count)
    frames.push(snap({ phase: 'answer', activeLine: L('append the count'), pythonLine: P('answers.append(count)'), queryIndex: qi, left: l, right: r, x: -1, nearest, count, message: `Answer for query ${qi + 1} is ${count}.` }))
  })
  frames.push(snap({ phase: 'done', activeLine: L('return answers'), pythonLine: P('return answers'), queryIndex: -1, left: -1, right: -1, x: -1, nearest: -1, count: null, result: answers, message: `Answers for the type 1 queries: [${answers.join(', ')}].` }))
  return { input: { nums: initial, queries }, result: answers, frames }
}

export const code = `keep a peak flag for every interior position
for each query in order
  if it is a type 1 query with range l to r
    count = 0 and nearest = none
    walk x from r minus 1 down to l
      if a peak lies strictly right of x and before r then nearest = that peak
      if nearest exists then add r minus nearest to count
    append the count to answers
  else it is a type 2 query with index and value
    set nums[index] to value
    refresh the peak flags at index minus 1, index and index plus 1
return answers`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def peaks_in_array(nums, queries):
    nums = list(nums)
    n = len(nums)
    def is_peak(i):
        return 1 <= i <= n - 2 and nums[i - 1] < nums[i] > nums[i + 1]
    peak = [is_peak(i) for i in range(n)]
    answers = []
    for query in queries:
        if query[0] == 1:
            _, l, r = query
            count = 0
            nearest = -1
            for x in range(r - 1, l - 1, -1):
                if x + 1 < r and peak[x + 1]:
                    nearest = x + 1
                if nearest >= 0:
                    count += r - nearest
            answers.append(count)
        else:
            _, i, v = query
            nums[i] = v
            for j in (i - 1, i, i + 1):
                if 0 <= j < n:
                    peak[j] = is_peak(j)
    return answers
`
const PY = python.split('\n').map((text, index) => ({ line: index + 1, text }))
