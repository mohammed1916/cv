export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 3 || nums.length > 10000 || nums.some(n => !Number.isInteger(n) || Math.abs(n) > 1000)) throw new Error('Enter a JSON array of 3–10,000 integers with |n| ≤ 1,000.')
  return nums
}

// Streaming: the best product uses the three largest, or the two smallest (both negative) and the largest.
export function buildTrace(nums) {
  let top = [-Infinity, -Infinity, -Infinity]
  let low = [Infinity, Infinity]
  const frames = [{ phase: 'start', top: [...top], low: [...low], value: null, activeLine: 2, message: 'Track the three largest and two smallest values seen so far.' }]
  for (const n of nums) {
    if (n > top[0]) { top = [n, top[0], top[1]] } else if (n > top[1]) { top = [top[0], n, top[1]] } else if (n > top[2]) { top = [top[0], top[1], n] }
    if (n < low[0]) { low = [n, low[0]] } else if (n < low[1]) { low = [low[0], n] }
    frames.push({ phase: 'scan', value: n, top: [...top], low: [...low], activeLine: 5, message: `Read ${n}: top ${top.join(', ')}; low ${low.join(', ')}.` })
  }
  const candidateA = top[0] * top[1] * top[2]
  const candidateB = low[0] * low[1] * top[0]
  const result = Math.max(candidateA, candidateB)
  frames.push({ phase: 'done', value: null, top: [...top], low: [...low], candidateA, candidateB, result, activeLine: 8, message: `Compare ${candidateA} (three largest) with ${candidateB} (two smallest × largest): ${result}.` })
  return { input: nums, result, frames }
}

export const code = `start the two smallest values and the three largest values as empty lists
for each value in the list
  keep only the two smallest values seen so far, in sorted order
  keep only the three largest values seen so far, in sorted order
compare the product of the three largest with the product of the two smallest and the largest
return the larger of those two products`.split('\n').map((text, index) => ({ line: index + 1, text }))

// The family visualizer reports its own step numbers (1 setup, 3 compare, 4 update, 5 return).
export const LINE_MAP = { 1: 1, 3: 5, 4: 4, 5: 6 }

export const python = `def maximum_product(nums):
    smallest, largest = [], []
    for value in nums:
        smallest = sorted(smallest + [value])[:2]
        largest = sorted(largest + [value], reverse=True)[:3]
    return max(largest[0] * largest[1] * largest[2], smallest[0] * smallest[1] * largest[0])`
