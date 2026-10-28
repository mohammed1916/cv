const MOD = 1000000007

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).sort().join() !== 'k,nums') {
    throw new Error('Use an object with exactly the keys nums and k.')
  }
  const { nums, k } = data
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Use 1 to 12 numbers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 20)) throw new Error('Numbers are integers from 1 to 20.')
  if (!Number.isInteger(k) || k < 0 || k > 20) throw new Error('k is an integer from 0 to 20.')
  return data
}

export function buildTrace(data) {
  const { nums, k } = data
  const n = nums.length
  // ways[i]: partitions of the first i numbers where every part has max - min at most k.
  const ways = Array(n + 1).fill(0)
  ways[0] = 1
  const frames = [{ phase: 'start', activeLine: L('set ways[0]'), i: 0, j: null, ways: [...ways], message: 'The empty prefix has one partition.' }]
  for (let i = 1; i <= n; i++) {
    let hi = -Infinity
    let lo = Infinity
    for (let j = i - 1; j >= 0; j--) {
      hi = Math.max(hi, nums[j])
      lo = Math.min(lo, nums[j])
      if (hi - lo > k) {
        frames.push({ phase: 'stop', activeLine: L('stop as soon'), i, j, ways: [...ways], message: `The part from ${j} to ${i - 1} has max - min = ${hi - lo} > ${k}. Stop extending it left.` })
        break
      }
      ways[i] = (ways[i] + ways[j]) % MOD
      frames.push({ phase: 'start-of-part', activeLine: L('add ways[j]'), i, j, ways: [...ways], message: `Part from ${j} to ${i - 1} has max - min = ${hi - lo}, so add ways[${j}] = ${ways[j]}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return ways[n]'), i: n, j: null, ways: [...ways], message: `Partitions of all ${n} numbers: ${ways[n]}.` })
  return { input: data, result: ways[n], frames, ways }
}

export const code = `count partitions where every part has max minus min at most k:
  set ways[0] to 1 for the empty prefix
  for each end position i from 1 to n:
    for each start j from i - 1 down to 0:
      widen the part from j to i - 1, updating its max and min
      stop as soon as max minus min is more than k
      add ways[j] to ways[i]
  return ways[n] modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_partitions(nums, k):
    mod = 1000000007
    n = len(nums)
    ways = [0] * (n + 1)
    ways[0] = 1
    for i in range(1, n + 1):
        hi = float('-inf')
        lo = float('inf')
        for j in range(i - 1, -1, -1):
            hi = max(hi, nums[j])
            lo = min(lo, nums[j])
            if hi - lo > k:
                break
            ways[i] = (ways[i] + ways[j]) % mod
    return ways[n]
`
