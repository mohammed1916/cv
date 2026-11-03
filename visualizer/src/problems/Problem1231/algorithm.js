// LeetCode 1231: Divide Chocolate. Binary search the answer x: x is achievable when a greedy
// left-to-right scan can close at least k + 1 pieces, each with sum at least x. Any leftover
// sweetness at the end merges into the last piece, which only raises its sum.
const MAX_PIECES = 12

export const phases = [
  { id: 'setup', label: 'Bounds', description: 'Read the bars and the cut count.' },
  { id: 'probe', label: 'Probe', description: 'Test a candidate minimum piece sum.' },
  { id: 'scan', label: 'Scan', description: 'Add bars to the running piece.' },
  { id: 'cut', label: 'Cut', description: 'The running piece reached the candidate.' },
  { id: 'accept', label: 'Feasible', description: 'Enough pieces, so raise the lower bound.' },
  { id: 'reject', label: 'Too many', description: 'Not enough pieces, so lower the upper bound.' },
  { id: 'done', label: 'Result', description: 'Report the largest feasible minimum.' },
]

export const code = `FUNCTION maximizeMinimumPiece(sweetness, k)
    lo ← 0; hi ← total of sweetness
    WHILE lo < hi
        mid ← ceil((lo + hi) / 2)
        IF canSplit(sweetness, k, mid) THEN lo ← mid
        ELSE hi ← mid - 1
    RETURN lo
FUNCTION canSplit(sweetness, k, x)
    pieces ← 0; running ← 0
    FOR each value in sweetness
        running ← running + value
        IF running ≥ x THEN pieces ← pieces + 1 and running ← 0
    RETURN pieces ≥ k + 1`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(entry => entry.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def can_split(sweetness, k, x):
    pieces = 0
    running = 0
    for value in sweetness:
        running += value
        if running >= x:
            pieces += 1
            running = 0
    return pieces >= k + 1


def maximize_minimum_piece(sweetness, k):
    lo, hi = 0, sum(sweetness)
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if can_split(sweetness, k, mid):
            lo = mid
        else:
            hi = mid - 1
    return lo


if __name__ == "__main__":
    import sys, json
    data = json.loads(sys.stdin.read())
    print(json.dumps(maximize_minimum_piece(data["sweetness"], data["k"])))
`

const PYTHON_LINES = python.split('\n')
const P = s => {
  const index = PYTHON_LINES.findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export function parseInput(text) {
  const input = typeof text === 'string' ? JSON.parse(text) : text
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with sweetness and k.')
  const { sweetness, k } = input
  if (!Array.isArray(sweetness) || sweetness.length < 1 || sweetness.length > MAX_PIECES) throw new Error(`sweetness lists 1 to ${MAX_PIECES} bars.`)
  if (!sweetness.every(value => Number.isInteger(value) && value >= 0)) throw new Error('Each bar is a nonnegative integer; the greedy check relies on that.')
  if (!Number.isInteger(k) || k < 0 || k > sweetness.length - 1) throw new Error('k is an integer from 0 to one less than the number of bars.')
  return { sweetness, k }
}

export function buildTrace({ sweetness, k }) {
  const frames = []
  const total = sweetness.reduce((sum, value) => sum + value, 0)
  const emit = (phase, codeText, pyText, message, extra = {}) => frames.push({
    phase, activeLine: L(codeText), pythonLine: P(pyText), message,
    lo: 0, hi: total, mid: null, cuts: [], scanTo: -1, running: 0, feasible: null, answer: null, ...extra,
  })

  let lo = 0
  let hi = total
  emit('setup', 'lo ← 0; hi ← total of sweetness', 'lo, hi = 0, sum(sweetness)', `${sweetness.length} bars, ${k} cuts, so ${k + 1} pieces. Sweetness totals ${total}.`)
  const canSplit = (x, record) => {
    let pieces = 0
    let running = 0
    const cuts = []
    for (let index = 0; index < sweetness.length; index += 1) {
      running += sweetness[index]
      if (record) emit('scan', 'running ← running + value', 'running += value', `Add bar ${index} (${sweetness[index]}); running piece is ${running}.`, { lo, hi, mid: record.mid, cuts: cuts.slice(), scanTo: index, running })
      if (running >= x) {
        pieces += 1
        cuts.push(index)
        if (record) emit('cut', 'IF running ≥ x THEN pieces', 'if running >= x', `Running piece reached ${x}; close piece ${pieces} after bar ${index}.`, { lo, hi, mid: record.mid, cuts: cuts.slice(), scanTo: index, running })
        running = 0
      }
    }
    return { ok: pieces >= k + 1, pieces, cuts }
  }
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2)
    emit('probe', 'mid ← ceil((lo + hi) / 2)', 'mid = (lo + hi + 1) // 2', `Can every piece reach ${mid}?`, { lo, hi, mid })
    const check = canSplit(mid, { mid })
    if (check.ok) {
      lo = mid
      emit('accept', 'IF canSplit(sweetness, k, mid) THEN lo ← mid', 'if can_split(sweetness, k, mid)', `${check.pieces} pieces reach ${mid}; ${k + 1} are needed, so ${mid} is achievable.`, { lo, hi, mid, cuts: check.cuts, feasible: true })
    } else {
      hi = mid - 1
      emit('reject', 'ELSE hi ← mid - 1', 'hi = mid - 1', `Only ${check.pieces} pieces reach ${mid}; ${mid} is too high.`, { lo, hi, mid, cuts: check.cuts, feasible: false })
    }
  }
  emit('done', 'RETURN lo', 'return lo', `The largest achievable minimum piece sum is ${lo}.`, { lo, hi, answer: lo })
  return { input: { sweetness, k }, result: lo, frames }
}
