const MOD = 1000000007n

export function parseInput(text) {
  const data = JSON.parse(text)
  const { nums, k, multiplier } = data ?? {}
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 8) throw new Error('Use "nums" as an array of 1 to 8 numbers.')
  if (nums.some(x => !Number.isInteger(x) || x < 1 || x > 20)) throw new Error('Each number is an integer from 1 to 20.')
  if (!Number.isInteger(k) || k < 1 || k > 30) throw new Error('"k" is an integer from 1 to 30 in this visualization.')
  if (!Number.isInteger(multiplier) || multiplier < 1 || multiplier > 5) throw new Error('"multiplier" is an integer from 1 to 5.')
  return { nums, k, multiplier }
}

export function buildTrace({ nums, k, multiplier }) {
  // Values are BigInt so the exact products stay correct; the answer is reduced modulo 1000000007 at the end.
  const m = BigInt(multiplier)
  const values = nums.map(v => BigInt(v))
  const frames = [{ phase: 'start', activeLine: L('set values to nums'), values: values.map(String), picked: -1, message: 'Each operation multiplies the first smallest value.' }]
  for (let round = 1; round <= k; round++) {
    let at = 0
    for (let i = 1; i < values.length; i++) if (values[i] < values[at]) at = i
    values[at] *= m
    frames.push({ phase: 'multiply', activeLine: L('multiply the first smallest'), values: values.map(String), picked: at, message: `Operation ${round}: index ${at} becomes ${values[at]}.` })
  }
  const result = values.map(v => Number(v % MOD))
  frames.push({ phase: 'done', activeLine: L('return every value modulo'), values: values.map(String), picked: -1, message: `Final array modulo 1000000007: [${result.join(', ')}].` })
  return { input: { nums, k, multiplier }, result, frames }
}

export const code = `final array state after k multiplication operations, modulo 1000000007
  set values to nums
  repeat k times
    find the first index i that holds the smallest value
    multiply the first smallest value by the multiplier
  return every value modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `import heapq

def final_array_state_mod(nums, k, multiplier):
    MOD = 10 ** 9 + 7
    if multiplier == 1:
        return [v % MOD for v in nums]
    heap = [(v, i) for i, v in enumerate(nums)]
    heapq.heapify(heap)
    biggest = max(nums)
    # Multiply the smallest while it is still at most the largest. After that, every value lies in one window,
    # so the remaining operations go round the sorted order, each value taking an equal share.
    while k > 0 and heap[0][0] * multiplier <= biggest:
        v, i = heapq.heappop(heap)
        biggest = max(biggest, v * multiplier)
        heapq.heappush(heap, (v * multiplier, i))
        k -= 1
    rounds, extra = divmod(k, len(nums))
    result = [0] * len(nums)
    for pos, (v, i) in enumerate(sorted(heap)):
        times = rounds + (1 if pos < extra else 0)
        result[i] = v % MOD * pow(multiplier, times, MOD) % MOD
    return result
`
