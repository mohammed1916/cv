// Try every choice of one removed element (or none). For the remaining array, a split after position i
// is valid when the gcd of the prefix equals the gcd of the suffix. Keep the best count over all choices.

const MAX_LENGTH = 12

const codeLines = [
  'best is 0',
  'for each removal choice: keep everything, or drop index r',
  '  b is the remaining array',
  '  count is 0',
  '  for each split i from 1 to len(b) minus 1',
  '    if gcd of b[0..i-1] equals gcd of b[i..]',
  '      add one to count',
  '  best is the larger of best and count',
  'return best',
]

export const code = codeLines.map((text, index) => ({ line: index + 1, text }))

const L = fragment => {
  const index = codeLines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`Missing pseudocode line: ${fragment}`)
  return index + 1
}

const pythonLines = [
  'from math import gcd',
  'from functools import reduce',
  'def max_valid_splits(nums):',
  '    best = 0',
  '    for removed in [None] + list(range(len(nums))):',
  '        b = [v for i, v in enumerate(nums) if i != removed]',
  '        count = 0',
  '        for i in range(1, len(b)):',
  '            if reduce(gcd, b[:i]) == reduce(gcd, b[i:]):',
  '                count += 1',
  '        best = max(best, count)',
  '    return best',
]

export const python = pythonLines.join('\n') + '\n'

const P = fragment => {
  const index = pythonLines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`Missing python line: ${fragment}`)
  return index + 1
}

function gcd(a, b) {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y) [x, y] = [y, x % y]
  return x
}

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > MAX_LENGTH) throw new Error(`Use an array of 2 to ${MAX_LENGTH} values.`)
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 1000)) throw new Error('Each value is an integer from 1 to 1000.')
  return nums
}

export function buildTrace(nums) {
  const frames = []
  let best = 0
  let bestChoice = null
  const choices = [null, ...nums.map((_, i) => i)]

  frames.push({ phase: 'start', pythonLine: P('best = 0'), activeLine: L('best is 0'), removed: -2, b: [], split: -1, leftG: null, rightG: null, count: 0, best, bestChoice, message: `Score the array with each one-element removal allowed, or none. Best starts at 0.` })

  for (const removed of choices) {
    const b = nums.filter((_, i) => i !== removed)
    const label = removed === null ? 'keep every element' : `remove index ${removed} (value ${nums[removed]})`
    frames.push({ phase: 'choice', pythonLine: P('for removed in'), activeLine: L('for each removal choice'), removed: removed === null ? -1 : removed, b, split: -1, leftG: null, rightG: null, count: 0, best, bestChoice, message: `Choice: ${label}.` })
    let count = 0
    for (let i = 1; i < b.length; i++) {
      const leftG = b.slice(0, i).reduce(gcd)
      const rightG = b.slice(i).reduce(gcd)
      const ok = leftG === rightG
      frames.push({ phase: 'split', pythonLine: P('if reduce(gcd, b[:i])'), activeLine: L('if gcd of b[0..i-1]'), removed: removed === null ? -1 : removed, b, split: i, leftG, rightG, ok, count, best, bestChoice, message: `Split after ${i}: gcd ${leftG} on the left, ${rightG} on the right${ok ? ', equal: count it.' : ', not equal.'}` })
      if (ok) {
        count += 1
        frames.push({ phase: 'add', pythonLine: P('count += 1'), activeLine: L('add one to count'), removed: removed === null ? -1 : removed, b, split: i, leftG, rightG, ok, count, best, bestChoice, message: `Count is ${count} for this choice.` })
      }
    }
    if (count > best) {
      best = count
      bestChoice = removed === null ? -1 : removed
    }
    frames.push({ phase: 'record', pythonLine: P('best = max'), activeLine: L('best is the larger'), removed: removed === null ? -1 : removed, b, split: -1, leftG: null, rightG: null, count, best, bestChoice, message: `This choice scores ${count}; best so far is ${best}.` })
  }
  frames.push({ phase: 'done', pythonLine: P('return best'), activeLine: L('return best'), removed: bestChoice ?? -2, b: [], split: -1, leftG: null, rightG: null, count: best, best, bestChoice, message: `Maximum score: ${best}.` })
  return { input: nums, result: best, frames }
}
