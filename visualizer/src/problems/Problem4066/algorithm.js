// Replacing every x with y changes only the adjacent pairs that touch an x:
// an equal pair (x, x) stays equal as (y, y), a pair (x, y) becomes equal, and every other pair is unaffected.
// So one replacement adds exactly C[x][y], the number of adjacent {x, y} pairs, to the current equal-pair count.
// The best choice is the most frequent adjacent pair of distinct values, or no change at all.

const MAX_LENGTH = 20

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

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > MAX_LENGTH) throw new Error('Use an array of 2 to 20 integers.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 1000000000)) throw new Error('Each value is an integer from 1 to 1000000000.')
  return nums
}

const keyOf = (a, b) => (a < b ? `${a},${b}` : `${b},${a}`)

export function buildTrace(nums) {
  const frames = []
  const pairCounts = new Map()
  let equal = 0
  frames.push({
    phase: 'setup', activeLine: L('equal ← 0'), pythonLine: P('equal = 0'),
    index: -1, pair: null, equal, pairs: [], best: 0, result: null,
    message: 'Start with no equal adjacent pairs and an empty table of distinct pairs.',
  })
  for (let i = 0; i + 1 < nums.length; i++) {
    const a = nums[i]
    const b = nums[i + 1]
    if (a === b) {
      equal++
      frames.push({
        phase: 'equal', activeLine: L('IF a equals b'), pythonLine: P('if a == b'),
        index: i, pair: [a, b], equal, pairs: snapshot(pairCounts), best: 0, result: null,
        message: `Positions ${i} and ${i + 1} both hold ${a}. Equal pairs: ${equal}.`,
      })
    } else {
      const key = keyOf(a, b)
      pairCounts.set(key, (pairCounts.get(key) || 0) + 1)
      frames.push({
        phase: 'distinct', activeLine: L('ELSE count the pair'), pythonLine: P('pairs[tuple(sorted'),
        index: i, pair: [a, b], equal, pairs: snapshot(pairCounts), best: 0, result: null,
        message: `${a} and ${b} differ. Replacing one with the other would make this pair equal, so tally {${a}, ${b}}.`,
      })
    }
  }
  const best = pairCounts.size ? Math.max(...pairCounts.values()) : 0
  frames.push({
    phase: 'best', activeLine: L('best ← largest tally'), pythonLine: P('best = max('),
    index: -1, pair: null, equal, pairs: snapshot(pairCounts), best, result: null,
    message: `Largest tally of a distinct adjacent pair is ${best}.`,
  })
  const result = equal + best
  frames.push({
    phase: 'done', activeLine: L('RETURN equal + best'), pythonLine: P('return equal + best'),
    index: -1, pair: null, equal, pairs: snapshot(pairCounts), best, result,
    message: `Maximum equal adjacent pairs: ${result}.`,
  })
  return { input: nums, result, frames }
}

function snapshot(pairCounts) {
  return [...pairCounts.entries()]
    .map(([key, count]) => ({ pair: key.split(',').map(Number), count }))
    .sort((x, y) => y.count - x.count || x.pair[0] - y.pair[0] || x.pair[1] - y.pair[1])
}

export const code = `FUNCTION maxEqualPairs(nums)
    equal ← 0
    pairs ← empty tally of distinct adjacent value pairs
    FOR each adjacent pair (a, b) in nums
        IF a equals b THEN equal ← equal + 1
        ELSE count the pair {a, b} in pairs
    best ← largest tally in pairs, or 0 when empty
    RETURN equal + best`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `from collections import Counter


def max_equal_pairs(nums):
    equal = 0
    pairs = Counter()
    for a, b in zip(nums, nums[1:]):
        if a == b:
            equal += 1
        else:
            pairs[tuple(sorted((a, b)))] += 1
    best = max(pairs.values(), default=0)
    return equal + best


if __name__ == "__main__":
    import json
    import sys
    print(max_equal_pairs(json.loads(sys.stdin.read())))
`
