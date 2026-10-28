export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.arr) || input.arr.length < 1 || input.arr.length > 12) throw new Error('Use an object with arr: an array of 1 to 12 integers.')
  if (input.arr.some(v => !Number.isInteger(v) || v < 1 || v > 12)) throw new Error('Each arr entry is an integer from 1 to 12.')
  if (!Number.isInteger(input.target) || input.target < 1 || input.target > 12) throw new Error('target is an integer from 1 to 12.')
  return { arr: input.arr, target: input.target }
}

export function buildTrace(input) {
  const { arr, target } = input
  const n = arr.length
  const prefix = [0]
  for (const v of arr) prefix.push(prefix[prefix.length - 1] + v)
  // last maps a prefix sum to the latest prefix index that has it.
  const last = new Map([[0, 0]])
  // bestEnd[b] is the shortest target-sum window that ends at or before prefix index b.
  const bestEnd = new Array(n + 1).fill(Infinity)
  let ans = Infinity
  const frames = [{ phase: 'start', activeLine: L('set bestEnd[0]'), index: -1, window: null, best: null, message: 'No window has been found yet.' }]
  for (let b = 1; b <= n; b++) {
    bestEnd[b] = bestEnd[b - 1]
    const need = prefix[b] - target
    let window = null
    if (last.has(need)) {
      const a = last.get(need)
      const length = b - a
      window = [a, b - 1]
      bestEnd[b] = Math.min(bestEnd[b], length)
      if (bestEnd[a] !== Infinity) ans = Math.min(ans, length + bestEnd[a])
    }
    last.set(prefix[b], b)
    frames.push({ phase: 'scan', activeLine: L('if need is in last'), index: b - 1, window, best: ans === Infinity ? null : ans, bestEnd: bestEnd[b], message: window ? `Window ${window[0]} to ${window[1]} sums to ${target}. Best total so far ${ans === Infinity ? 'none' : ans}.` : `No window ends at ${b - 1} with sum ${target}.` })
  }
  const result = ans === Infinity ? -1 : ans
  frames.push({ phase: 'done', activeLine: L('return -1 if'), index: n, window: null, best: result, message: `Smallest total length: ${result}.` })
  return { input, result, frames }
}

export const code = `minimum total length of two non-overlapping subarrays each summing to target
  set prefix[0] to 0 and prefix[i] to the sum of the first i values
  set last to a map holding 0 at prefix index 0
  set bestEnd[0] to infinity and ans to infinity
  for each end b from 1 to n do
    set bestEnd[b] to bestEnd[b - 1]
    set need to prefix[b] minus target
    if need is in last then
      set a to last[need] and length to b minus a
      set bestEnd[b] to the smaller of bestEnd[b] and length
      if bestEnd[a] is finite then update ans with length plus bestEnd[a]
    set last[prefix[b]] to b
  return -1 if ans is infinite, otherwise ans`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_sum_of_two_lengths(arr, target):
    n = len(arr)
    prefix = [0] * (n + 1)
    for i, v in enumerate(arr):
        prefix[i + 1] = prefix[i] + v
    last = {0: 0}
    best_end = [float('inf')] * (n + 1)
    ans = float('inf')
    for b in range(1, n + 1):
        best_end[b] = best_end[b - 1]
        need = prefix[b] - target
        if need in last:
            a = last[need]
            length = b - a
            best_end[b] = min(best_end[b], length)
            if best_end[a] != float('inf'):
                ans = min(ans, length + best_end[a])
        last[prefix[b]] = b
    return -1 if ans == float('inf') else ans
`
