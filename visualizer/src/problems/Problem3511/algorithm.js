export const phases = [
  { id: 'start', label: 'Read', description: 'Read the array.' },
  { id: 'collect', label: 'Collect', description: 'List every window of length at least 3 whose sum is not positive.' },
  { id: 'check', label: 'Check', description: 'Is this window already hit by a replaced position?' },
  { id: 'replace', label: 'Replace', description: 'Replace the right end of the window.' },
  { id: 'done', label: 'Result', description: 'Return the number of replacements.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input) || input.length < 1 || input.length > 10) throw new Error('Use an array of 1 to 10 integers.')
  if (!input.every(v => Number.isInteger(v) && v >= -9 && v <= 9)) throw new Error('Each value is an integer from -9 to 9.')
  return input.slice()
}

export const code = [
  'fewest replacements to make the array positive',
  '  bad = every window of length at least 3 with sum at most 0',
  '  sort bad windows by right end',
  '  last = -1, count = 0',
  '  for each window [l, r] in that order',
  '    if last < l, replace nums[r] and set last = r, count + 1',
  '  return count',
].map((text, index) => ({ line: index + 1, text }))

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

export function buildTrace(nums) {
  const n = nums.length
  const frames = []
  const sumOf = (l, r) => nums.slice(l, r + 1).reduce((a, b) => a + b, 0)
  const bad = []
  for (let l = 0; l < n; l++) {
    for (let r = l + 2; r < n; r++) {
      if (sumOf(l, r) <= 0) bad.push({ l, r, sum: sumOf(l, r) })
    }
  }
  bad.sort((a, b) => a.r - b.r || a.l - b.l)
  const replaced = []
  let last = -1
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, nums, replaced: replaced.slice(), bad, current: -1, ...extra,
  })
  push('start', L('fewest replacements'), P('def min_replacements'), `Read ${n} values. A window of length 3 or more must have a positive sum.`)
  push('collect', L('bad = every window'), P('bad = []'), `${bad.length} window${bad.length === 1 ? '' : 's'} of length 3 or more ${bad.length === 1 ? 'is' : 'are'} not positive.`)
  push('collect', L('sort bad windows'), P('bad.sort()'), 'Sort those windows by right end, so one replacement can serve as many as possible.')
  push('collect', L('last = -1'), P('last = -1'), 'Start with no replaced position (last = -1) and a count of 0.')
  bad.forEach((w, index) => {
    push('check', L('for each window'), P('for r, l in bad'), `Window [${w.l}, ${w.r}] has sum ${w.sum}. ${last < w.l ? 'No replaced position lies inside it.' : `Position ${last} already lies inside it.`}`, { current: index, last, window: w })
    if (last < w.l) {
      last = w.r
      replaced.push(w.r)
      push('replace', L('replace nums[r]'), P('last = r'), `Replace nums[${w.r}]; this window and every later window ending at or before ${w.r} containing it are now positive.`, { current: index, last, window: w })
    }
  })
  push('done', L('return count'), P('return count'), `${replaced.length} replacement${replaced.length === 1 ? ' is' : 's are'} needed.`, { result: replaced.length, current: -1 })
  return { input: nums, result: replaced.length, frames }
}

export const python = `def min_replacements(nums):
    n = len(nums)
    bad = []
    for l in range(n):
        for r in range(l + 2, n):
            if sum(nums[l:r + 1]) <= 0:
                bad.append((r, l))
    bad.sort()
    last = -1
    count = 0
    for r, l in bad:
        if last < l:
            last = r
            count += 1
    return count
`
