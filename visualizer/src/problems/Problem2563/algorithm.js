export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums)) throw new Error('Use an object with a "nums" array, "lower" and "upper".')
  const { nums, lower, upper } = input
  if (nums.length < 1 || nums.length > 30) throw new Error('nums holds 1 to 30 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < -20 || v > 20)) throw new Error('Each number is an integer from -20 to 20.')
  if (!Number.isInteger(lower) || !Number.isInteger(upper) || lower < -40 || upper > 40 || lower > upper) throw new Error('lower and upper are integers from -40 to 40 with lower at most upper.')
  return { nums, lower, upper }
}

// Two pointers over the sorted values: count index pairs i < j whose sum is at most limit.
function countAtMost(sorted, limit, frames, pass) {
  let i = 0
  let j = sorted.length - 1
  let count = 0
  while (i < j) {
    const sum = sorted[i] + sorted[j]
    const fits = sum <= limit
    frames.push({ phase: 'step', activeLine: L('if the sum at i and j'), pass, i, j, sum, limit, count, sorted, message: `${pass} pass: ${sorted[i]} + ${sorted[j]} = ${sum} ${fits ? 'is' : 'is not'} at most ${limit}.` })
    if (fits) {
      count += j - i
      i++
    } else {
      j--
    }
  }
  return count
}

export function buildTrace(input) {
  const { nums, lower, upper } = input
  const sorted = [...nums].sort((a, b) => a - b)
  const frames = [{ phase: 'sort', activeLine: L('sort a copy'), pass: 'start', i: 0, j: sorted.length - 1, sum: null, limit: null, count: 0, sorted, message: 'Sort a copy of the numbers so pairs can be counted with two pointers.' }]
  const atMostUpper = countAtMost(sorted, upper, frames, 'upper')
  const atMostLower = countAtMost(sorted, lower - 1, frames, 'lower')
  const pairs = atMostUpper - atMostLower
  frames.push({ phase: 'done', activeLine: L('return pairs'), pass: 'done', i: -1, j: -1, sum: null, limit: null, count: pairs, sorted, message: `Fair pairs: ${pairs}.` })
  return { input, result: pairs, frames }
}

export const code = `count pairs whose sum lies between lower and upper
  sort a copy of the numbers
  set pairs to the count at most upper minus the count at most lower minus one
  return pairs
count pairs with sum at most a limit
  set i to zero, j to the last index and count to zero
  while i is less than j
    if the sum at i and j is at most the limit then
      add j minus i to count, since every index from i plus one to j pairs with i
      move i right
    otherwise move j left
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_fair_pairs(nums, lower, upper):
    ordered = sorted(nums)

    def at_most(limit):
        i, j = 0, len(ordered) - 1
        count = 0
        while i < j:
            if ordered[i] + ordered[j] <= limit:
                count += j - i
                i += 1
            else:
                j -= 1
        return count

    return at_most(upper) - at_most(lower - 1)
`
