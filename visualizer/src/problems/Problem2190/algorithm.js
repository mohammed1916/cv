// LeetCode 2190: Most Frequent Number Following Key In an Array.
// Look at every adjacent pair (a, b). When a is key, count b. The answer is the value whose count reaches the
// highest level first; the statement guarantees a single most frequent value.

const MAX_LEN = 14
const MAX_VALUE = 200

export function parseInput(text) {
  let spec
  try { spec = JSON.parse(text) } catch { throw new Error('Use JSON like {"nums":[1,100,200,1,100],"key":1}.') }
  if (!spec || !Array.isArray(spec.nums) || !Number.isInteger(spec.key)) throw new Error('Give a nums array and an integer key.')
  if (spec.nums.length < 2 || spec.nums.length > MAX_LEN) throw new Error(`Use 2 to ${MAX_LEN} values. The visualization caps the length there.`)
  if (!spec.nums.every(v => Number.isInteger(v) && v >= 0 && v <= MAX_VALUE)) throw new Error(`Each value is an integer from 0 to ${MAX_VALUE}.`)
  if (!spec.nums.includes(spec.key)) throw new Error('key must appear in nums.')
  return { nums: spec.nums, key: spec.key }
}

export const code = `FUNCTION mostFrequent(nums, key)
    cnt ← empty counts
    ans ← 0
    best ← 0
    FOR i from 0 to length(nums) - 2
        a ← nums[i]
        b ← nums[i + 1]
        IF a = key THEN
            cnt[b] ← cnt[b] + 1
            IF best < cnt[b] THEN
                best ← cnt[b]
                ans ← b
    RETURN ans`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def most_frequent(nums, key):
    cnt = Counter()
    ans = best = 0
    for a, b in pairwise(nums):
        if a == key:
            cnt[b] += 1
            if best < cnt[b]:
                best = cnt[b]
                ans = b
    return ans
`

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

export const phases = [
  { id: 'start', label: 'Pairs', description: 'Walk the adjacent pairs and watch for key on the left.' },
  { id: 'count', label: 'Count', description: 'Count the value that follows each key.' },
  { id: 'done', label: 'Result', description: 'The value with the highest count.' },
]

export function buildTrace({ nums, key }) {
  const cnt = new Map()
  let ans = 0
  let best = 0
  const frames = []
  const push = (phase, i, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, index: i, i, activeLine, pythonLine, message, nums, key, cnt: new Map(cnt), ans, best, ...extra,
  })
  push('start', -1, L('cnt ← empty'), P('cnt = Counter()'), `Looking for pairs where ${key} comes first.`)
  for (let i = 0; i < nums.length - 1; i++) {
    const a = nums[i]
    const b = nums[i + 1]
    if (a !== key) {
      push('start', i, L('IF a = key'), P('if a == key'), `Pair (${a}, ${b}): ${a} is not ${key}, so nothing is counted.`)
      continue
    }
    cnt.set(b, (cnt.get(b) || 0) + 1)
    if (best < cnt.get(b)) { best = cnt.get(b); ans = b }
    push('count', i, L('cnt[b] ← cnt[b] + 1'), P('cnt[b] += 1'),
      `Pair (${a}, ${b}): ${b} follows ${key} and now has ${cnt.get(b)}. Leader: ${ans} with ${best}.`, { b, follows: cnt.get(b) })
  }
  push('done', -1, L('RETURN ans'), P('return ans'), `${ans} follows ${key} most often, ${best} time(s).`)
  return { input: { nums, key }, result: ans, frames }
}
