export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with nums and queries, for example {"nums":[2,1,3,1,2],"queries":[[1,2],[3,3]]}.')
  const { nums, queries } = data
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 10) throw new Error('nums must have 2 to 10 entries.')
  if (nums.some(x => !Number.isInteger(x) || x < 1 || x > 50)) throw new Error('nums values are integers from 1 to 50.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 6) throw new Error('queries must have 1 to 6 pairs.')
  for (const q of queries) {
    if (!Array.isArray(q) || q.length !== 2 || !Number.isInteger(q[0]) || q[0] < 0 || q[0] >= nums.length) throw new Error('Each query is [idx, val] with idx inside nums.')
    if (!Number.isInteger(q[1]) || q[1] < 1 || q[1] > 50) throw new Error('Each val is an integer from 1 to 50.')
  }
  return { nums: [...nums], queries: queries.map(q => [...q]) }
}

function isPrime(x) {
  if (x < 2) return false
  for (let d = 2; d * d <= x; d++) if (x % d === 0) return false
  return true
}

export function buildTrace(input) {
  const nums = [...input.nums]
  const n = nums.length
  const answers = []
  const frames = [{ phase: 'start', activeLine: L('for each query [idx, val]'), query: null, best: null, message: 'Each query changes one value, and the change stays for later queries.' }]
  for (const [idx, val] of input.queries) {
    nums[idx] = val
    let best = 0
    let bestSplit = 1
    for (let k = 1; k < n; k++) {
      const left = new Set(nums.slice(0, k).filter(isPrime))
      const right = new Set(nums.slice(k).filter(isPrime))
      const total = left.size + right.size
      if (total > best) { best = total; bestSplit = k }
    }
    answers.push(best)
    frames.push({ phase: 'query', activeLine: L('for each split k'), query: [idx, val], best, split: bestSplit, message: `After setting nums[${idx}] to ${val}, the best split at ${bestSplit} gives ${best} distinct primes.` })
  }
  frames.push({ phase: 'done', activeLine: L('return the answers'), query: null, best: null, message: 'Every query has been answered in order.' })
  return { input, result: answers, frames }
}

export const code = `maximize distinct primes after split (nums, queries)
  set answers to an empty list
  for each query [idx, val] in order
    set nums[idx] to val
    set best to 0
    for each split k from 1 to n - 1
      count the distinct primes in nums[0..k-1] and in nums[k..n-1]
      if the total is more than best then set best to the total
    append best to answers
  return the answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_distinct_primes_after_split(nums, queries):
    def is_prime(x):
        if x < 2:
            return False
        d = 2
        while d * d <= x:
            if x % d == 0:
                return False
            d += 1
        return True

    nums = list(nums)
    n = len(nums)
    answers = []
    for idx, val in queries:
        nums[idx] = val
        best = 0
        for k in range(1, n):
            left = {x for x in nums[:k] if is_prime(x)}
            right = {x for x in nums[k:] if is_prime(x)}
            best = max(best, len(left) + len(right))
        answers.append(best)
    return answers
`
