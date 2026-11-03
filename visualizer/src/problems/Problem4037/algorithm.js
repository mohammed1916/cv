const PHASES = [
  { id: 'baseline', label: 'Keep all', description: 'Score the array with no element removed.' },
  { id: 'remove', label: 'Remove one', description: 'Delete one element and score what remains.' },
  { id: 'split', label: 'Split', description: 'Compare the gcd of the prefix with the gcd of the suffix.' },
  { id: 'best', label: 'Best', description: 'Keep the highest score seen so far.' },
  { id: 'done', label: 'Answer', description: 'Report the maximum score.' },
]

export const phases = PHASES

const CODE_LINES = [
  'maximum number of valid split positions after removing at most one element',
  'best is the score of nums with nothing removed',
  'for each index r',
  '  b is nums with index r removed',
  '  score b and keep the larger value in best',
  'return best',
  'score(b): if b has fewer than 2 elements return 0',
  '  pre[i] is the gcd of b[0..i) and suf[i] is the gcd of b[i..m)',
  '  for each split i from 1 to m minus 1',
  '    count the split when pre[i] equals suf[i]',
]

export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }))

function L(fragment) {
  const index = code.findIndex(c => c.text.includes(fragment))
  if (index < 0) throw new Error(`Missing pseudocode line: ${fragment}`)
  return index + 1
}

export const python = `from math import gcd

def score(b):
    m = len(b)
    if m < 2:
        return 0
    pre = [0] * (m + 1)
    for i in range(m):
        pre[i + 1] = gcd(pre[i], b[i])
    suf = [0] * (m + 1)
    for i in range(m - 1, -1, -1):
        suf[i] = gcd(suf[i + 1], b[i])
    return sum(1 for i in range(1, m) if pre[i] == suf[i])

def max_valid_split(nums):
    best = score(nums)
    for r in range(len(nums)):
        best = max(best, score(nums[:r] + nums[r + 1:]))
    return best
`

const PY = python.split('\n')

function P(fragment) {
  const index = PY.findIndex(line => line.includes(fragment))
  if (index < 0) throw new Error(`Missing Python line: ${fragment}`)
  return index + 1
}

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 9) throw new Error('nums has 2 to 9 integers.')
  if (!nums.every(x => Number.isInteger(x) && x >= 1 && x <= 1000000000)) throw new Error('Each value is an integer from 1 to 1000000000.')
  return { nums }
}

// Score one array: the number of splits whose two sides have equal gcd.
function scoreWithFrames(b, frames, context) {
  const m = b.length
  if (m < 2) return 0
  const pre = [0]
  for (let i = 0; i < m; i++) pre.push(gcd(pre[i], b[i]))
  const suf = Array(m + 1).fill(0)
  for (let i = m - 1; i >= 0; i--) suf[i] = gcd(suf[i + 1], b[i])
  let count = 0
  for (let i = 1; i < m; i++) {
    const matched = pre[i] === suf[i]
    if (matched) count++
    frames.push({ ...context, pythonLine: P('return sum'), phase: 'split', activeLine: L('for each split i'), split: i, pre: pre[i], suf: suf[i], matched, count, message: `Split after ${i} element${i === 1 ? '' : 's'}: prefix gcd ${pre[i]}, suffix gcd ${suf[i]}${matched ? ', equal, counted' : ', not equal'}.` })
  }
  return count
}

export function buildTrace({ nums }) {
  const frames = []
  const n = nums.length
  let best = -1
  let bestRemoved = null
  const base = (phase, removed, b) => ({ removed, b, best, bestRemoved })
  const baseline = scoreWithFrames(nums, frames, { ...base('baseline', null, nums), pythonLine: P('best = score(nums)'), activeLine: L('best is the score') })
  best = baseline
  bestRemoved = null
  frames.push({ ...base('best', null, nums), pythonLine: P('best = score(nums)'), phase: 'best', activeLine: L('score b and keep'), best, bestRemoved, message: `Nothing removed scores ${baseline}.` })
  for (let r = 0; r < n; r++) {
    const b = nums.filter((_, index) => index !== r)
    frames.push({ ...base('remove', r, b), pythonLine: P('for r in range'), phase: 'remove', activeLine: L('for each index r'), best, bestRemoved, message: `Remove index ${r} (value ${nums[r]}); the rest is [${b.join(', ')}].` })
    const s = scoreWithFrames(b, frames, { ...base('split', r, b), pythonLine: P('pre[i + 1]'), activeLine: L('score(b)'), best, bestRemoved })
    if (s > best) {
      best = s
      bestRemoved = r
      frames.push({ ...base('best', r, b), pythonLine: P('best = max'), phase: 'best', activeLine: L('score b and keep'), best, bestRemoved, message: `Removing index ${r} scores ${s}, a new best.` })
    } else {
      frames.push({ ...base('best', r, b), pythonLine: P('best = max'), phase: 'best', activeLine: L('score b and keep'), best, bestRemoved, message: `Removing index ${r} scores ${s}; the best stays ${best}.` })
    }
  }
  frames.push({ ...base('done', bestRemoved, []), pythonLine: P('return best'), phase: 'done', activeLine: L('return best'), best, bestRemoved, message: `Maximum score is ${best}${bestRemoved === null ? ' with nothing removed' : ` after removing index ${bestRemoved}`}.` })
  return { input: { nums }, result: best, frames }
}
