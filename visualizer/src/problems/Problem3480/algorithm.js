const PSEUDO = [
  'count subarrays after removing one pair',
  'set best to zero',
  'for each pair index to skip',
  'last is an empty table over the right ends',
  'for each pair that is not skipped',
  'record the larger value with its smaller partner',
  'total is zero and blocked is zero',
  'for each right end from 1 to n',
  'blocked is the largest left partner so far',
  'add right minus blocked to total',
  'keep the larger of best and total',
  'return best',
]
export const code = PSEUDO.map((text, index) => ({ line: index + 1, text }))
const PS = key => code.find(entry => entry.text.includes(key))?.line ?? 1

export const python = `def max_subarrays(n, conflicting_pairs):
    pairs = [(min(a, b), max(a, b)) for a, b in conflicting_pairs]
    best = 0
    for skip in range(len(pairs)):
        last_left = [0] * (n + 1)
        for index, (a, b) in enumerate(pairs):
            if index != skip:
                last_left[b] = max(last_left[b], a)
        total = 0
        blocked = 0
        for right in range(1, n + 1):
            blocked = max(blocked, last_left[right])
            total += right - blocked
        best = max(best, total)
    return best
`
const PYTHON_LINES = python.split('\n')
const PY = key => PYTHON_LINES.findIndex(text => text.includes(key)) + 1

const frame = fields => ({ ...fields, activeLine: PS(fields.pseudo), pythonLine: PY(fields.py) })

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n and conflictingPairs.')
  const { n, conflictingPairs } = input
  if (!Number.isInteger(n) || n < 2 || n > 10) throw new Error('n is an integer from 2 to 10.')
  if (!Array.isArray(conflictingPairs) || conflictingPairs.length < 1 || conflictingPairs.length > 2 * n) throw new Error('conflictingPairs has between 1 and 2n pairs.')
  for (const pair of conflictingPairs) {
    if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(v => Number.isInteger(v) && v >= 1 && v <= n) || pair[0] === pair[1]) {
      throw new Error('Each pair is two different integers from 1 to n.')
    }
  }
  return { n, conflictingPairs }
}

// For a fixed set of pairs, a subarray ending at right is bad when its left end is at or before the
// largest smaller member of any pair whose larger member is at or before right.
export function buildTrace({ n, conflictingPairs }) {
  const pairs = conflictingPairs.map(([a, b]) => [Math.min(a, b), Math.max(a, b)])
  const frames = []
  let best = 0
  let bestSkip = -1
  frames.push(frame({ phase: 'start', pseudo: 'set best to zero', py: 'best = 0', at: -1, skip: -1, right: 0, blocked: 0, total: 0, best,
    message: `Try removing each of the ${pairs.length} pairs in turn.` }))
  for (let skip = 0; skip < pairs.length; skip++) {
    const lastLeft = Array(n + 1).fill(0)
    frames.push(frame({ phase: 'skip', pseudo: 'for each pair that is not skipped', py: 'for index, (a, b)', at: -1, skip, right: 0, blocked: 0, total: 0, best,
      message: `Remove pair [${pairs[skip]}] and build the remaining table.` }))
    pairs.forEach(([a, b], index) => {
      if (index === skip) return
      lastLeft[b] = Math.max(lastLeft[b], a)
    })
    frames.push(frame({ phase: 'table', pseudo: 'record the larger value', py: 'last_left[b] = max', at: -1, skip, right: 0, blocked: 0, total: 0, best,
      message: `Table of largest smaller partners: [${lastLeft.slice(1).join(', ')}].` }))
    let total = 0
    let blocked = 0
    for (let right = 1; right <= n; right++) {
      blocked = Math.max(blocked, lastLeft[right])
      total += right - blocked
      frames.push(frame({ phase: 'count', pseudo: 'add right minus blocked', py: 'total += right - blocked', at: right - 1, skip, right, blocked, total, best,
        message: `Right end ${right}: left ends ${blocked + 1} to ${right} avoid every pair, adding ${right - blocked}.` }))
    }
    if (total > best) {
      best = total
      bestSkip = skip
      frames.push(frame({ phase: 'keep', pseudo: 'keep the larger of best', py: 'best = max(best, total)', at: -1, skip, right: n, blocked: 0, total, best,
        message: `New best ${best} after removing pair [${pairs[skip]}].` }))
    } else {
      frames.push(frame({ phase: 'keep', pseudo: 'keep the larger of best', py: 'best = max(best, total)', at: -1, skip, right: n, blocked: 0, total, best,
        message: `Total ${total} does not beat ${best}.` }))
    }
  }
  frames.push(frame({ phase: 'done', pseudo: 'return best', py: 'return best', at: -1, skip: bestSkip, right: 0, blocked: 0, total: best, best,
    message: `Maximum subarray count is ${best}.` }))
  return { input: { n, conflictingPairs }, result: best, frames }
}
