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

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function heightChecker(heights) {', 'def height_checker(heights):'],
  ['  const expected = [...heights].sort((a, b) => a - b)', '    expected = sorted(heights)'],
  ['  let count = 0', '    count = 0'],
  ['  for (let i = 0; i < heights.length; i++) {', '    for i in range(len(heights)):'],
  ['    if (heights[i] !== expected[i]) count += 1', '        if heights[i] != expected[i]: count += 1'],
  ['  }', ''],
  ['  return count', '    return count'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace(input) {
  const { heights } = input
  const frames = []
  const expected = [...heights].sort((a, b) => a - b)
  const mismatches = []
  let count = 0

  const frame = (phase, pythonLine, activeLine, message, current, expectedShown) => frames.push({
    phase, pythonLine, activeLine, message,
    snapshot: { heights, expected: expectedShown, current, mismatches: [...mismatches], count },
  })

  frame('start', P('def height_checker'), L('function heightChecker'), `Start with ${heights.length} positions. Heights are compared in their original order.`, -1, null)
  frame('sort', P('expected = sorted'), L('const expected'), `The target lineup is ${expected.join(', ')}. Sorting a copy keeps the original visible.`, -1, expected)
  for (let i = 0; i < heights.length; i++) {
    const differs = heights[i] !== expected[i]
    frame('compare', P('if heights[i] != expected[i]'), L('if (heights[i] !== expected[i])'), `Position ${i}: ${heights[i]} against target ${expected[i]}. ${differs ? 'They differ.' : 'They match.'}`, i, expected)
    if (differs) {
      mismatches.push(i)
      count += 1
      frame('count', P('count += 1'), L('count += 1'), `Position ${i} is a mismatch, so the count becomes ${count}.`, i, expected)
    }
  }
  frame('done', P('return count'), L('return count'), `${count} positions differ from the target lineup, so that is the answer.`, -1, expected)
  return { input, result: count, frames }
}
