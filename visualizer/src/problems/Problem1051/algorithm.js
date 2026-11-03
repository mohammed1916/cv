export const phases = [
  { id: 'start', label: 'Lineup', description: 'Keep the lineup as given. Its positions are what we compare.' },
  { id: 'sort', label: 'Sorted copy', description: 'Sort a copy to get the target lineup. The original list is not changed.' },
  { id: 'compare', label: 'Compare position', description: 'Check one position against the target at that same position.' },
  { id: 'count', label: 'Count mismatch', description: 'The heights differ here, so this position adds one.' },
  { id: 'done', label: 'Complete', description: 'The count is the number of positions that differ from the target.' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.heights)) {
    throw new Error('Use an object with a heights array, for example {"heights":[3,1,2]}.')
  }
  const { heights } = data
  if (heights.length < 1 || heights.length > 30) throw new Error('heights must have 1 to 30 values.')
  if (!heights.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('Each height must be an integer from 1 to 100.')
  return { heights }
}

export const code = `height_checker(heights):
  expected = sorted copy of heights
  count = 0
  for each position i:
    if heights[i] differs from expected[i]:
      count = count + 1
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def height_checker(heights):
    expected = sorted(heights)
    count = 0
    for i in range(len(heights)):
        if heights[i] != expected[i]:
            count += 1
    return count`

const LINE = { start: 1, sort: 2, compare: 5, count: 6, done: 7 }

export function buildTrace(input) {
  const { heights } = input
  const frames = []
  const expected = [...heights].sort((a, b) => a - b)
  const mismatches = []
  let count = 0

  const frame = (phase, activeLine, message, current, expectedShown) => frames.push({
    phase, activeLine, message,
    snapshot: { heights, expected: expectedShown, current, mismatches: [...mismatches], count },
  })

  frame('start', LINE.start, `Start with ${heights.length} positions. Heights are compared in their original order.`, -1, null)
  frame('sort', LINE.sort, `The target lineup is ${expected.join(', ')}. Sorting a copy keeps the original visible.`, -1, expected)
  for (let i = 0; i < heights.length; i++) {
    const differs = heights[i] !== expected[i]
    frame('compare', LINE.compare, `Position ${i}: ${heights[i]} against target ${expected[i]}. ${differs ? 'They differ.' : 'They match.'}`, i, expected)
    if (differs) {
      mismatches.push(i)
      count += 1
      frame('count', LINE.count, `Position ${i} is a mismatch, so the count becomes ${count}.`, i, expected)
    }
  }
  frame('done', LINE.done, `${count} positions differ from the target lineup, so that is the answer.`, -1, expected)
  return { input, result: count, frames }
}
