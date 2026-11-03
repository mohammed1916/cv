// Collect the indices of every value. A value counts when it appears at least three times
// and every neighbouring pair of its indices has the same gap as the first pair.

const MAX_LENGTH = 20

const codeLines = [
  'positions is an empty table',
  'for each index i',
  '  append i to positions[nums[i]]',
  'count is 0',
  'for each value and its list of positions idx',
  '  if idx has fewer than three entries, skip it',
  '  gap is idx[1] minus idx[0]',
  '  if every consecutive gap equals gap, add one to count',
  'return count',
]

export const code = codeLines.map((text, index) => ({ line: index + 1, text }))

const L = fragment => {
  const index = codeLines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`Missing pseudocode line: ${fragment}`)
  return index + 1
}

const pythonLines = [
  'def count_equally_spaced_all(nums):',
  '    positions = {}',
  '    for i, v in enumerate(nums):',
  '        positions.setdefault(v, []).append(i)',
  '    count = 0',
  '    for idx in positions.values():',
  '        if len(idx) < 3:',
  '            continue',
  '        gap = idx[1] - idx[0]',
  '        if all(idx[t + 1] - idx[t] == gap for t in range(len(idx) - 1)):',
  '            count += 1',
  '    return count',
]

export const python = pythonLines.join('\n') + '\n'

const P = fragment => {
  const index = pythonLines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`Missing python line: ${fragment}`)
  return index + 1
}

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 3 || nums.length > MAX_LENGTH) throw new Error(`Use an array of 3 to ${MAX_LENGTH} values.`)
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 1000000000)) throw new Error('Each value is an integer from 1 to 1000000000.')
  return nums
}

export function buildTrace(nums) {
  const frames = []
  const positions = new Map()
  const snapshot = () => [...positions.entries()].map(([value, idx]) => [value, [...idx]])
  let count = 0

  nums.forEach((value, i) => {
    if (!positions.has(value)) positions.set(value, [])
    positions.get(value).push(i)
    frames.push({ phase: 'collect', pythonLine: P('positions.setdefault'), activeLine: L('append i to positions'), at: i, positions: snapshot(), value: null, pair: -1, verdict: null, count, message: `Index ${i} holds ${value}.` })
  })
  frames.push({ phase: 'start', pythonLine: P('count = 0'), activeLine: L('count is 0'), at: -1, positions: snapshot(), value: null, pair: -1, verdict: null, count, message: 'Every value has its full list of indices.' })

  for (const [value, idx] of positions) {
    if (idx.length < 3) {
      frames.push({ phase: 'skip', pythonLine: P('if len(idx) < 3'), activeLine: L('if idx has fewer'), at: -1, positions: snapshot(), value, pair: -1, verdict: 'skip', count, message: `${value} appears ${idx.length} time${idx.length === 1 ? '' : 's'}; it needs at least three.` })
      continue
    }
    const gap = idx[1] - idx[0]
    frames.push({ phase: 'gap', pythonLine: P('gap = idx[1]'), activeLine: L('gap is idx[1]'), at: -1, positions: snapshot(), value, pair: 0, gap, verdict: null, count, message: `${value}: the first gap is ${gap}.` })
    let ok = true
    for (let t = 0; t < idx.length - 1; t++) {
      const step = idx[t + 1] - idx[t]
      if (step !== gap) {
        ok = false
        frames.push({ phase: 'mismatch', pythonLine: P('if all('), activeLine: L('if every consecutive gap'), at: -1, positions: snapshot(), value, pair: t + 1, gap, verdict: 'gaps differ', count, message: `${value}: the gap ${idx[t]} to ${idx[t + 1]} is ${step}, not ${gap}; not counted.` })
        break
      }
      frames.push({ phase: 'pair', pythonLine: P('if all('), activeLine: L('if every consecutive gap'), at: -1, positions: snapshot(), value, pair: t + 1, gap, verdict: null, count, message: `${value}: gap ${idx[t]} to ${idx[t + 1]} is ${step}, matching ${gap}.` })
    }
    if (ok) {
      count += 1
      frames.push({ phase: 'add', pythonLine: P('count += 1'), activeLine: L('add one to count'), at: -1, positions: snapshot(), value, pair: idx.length - 1, gap, verdict: 'counted', count, message: `${value} has constant gaps of ${gap}; count is now ${count}.` })
    }
  }
  frames.push({ phase: 'done', pythonLine: P('return count'), activeLine: L('return count'), at: -1, positions: snapshot(), value: null, pair: -1, verdict: null, count, message: `Answer: ${count}.` })
  return { input: nums, result: count, frames }
}
