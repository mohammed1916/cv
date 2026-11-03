// Maximum transactions without negative balance.
// Transactions are processed in their original order from a balance of zero. A transaction may be skipped,
// but every retained prefix must leave a nonnegative balance. Greedy: keep every transaction, remember the
// negative ones in a min-heap, and when the balance dips below zero drop the most negative kept one.
// Dropping a negative amount only raises later prefix balances, so earlier decisions stay valid.

const CODE_TEXT = `FUNCTION maxRetained(transactions)
    balance ← 0; kept ← 0
    negatives ← empty min-heap of (amount, position)
    FOR each position p with amount x in transactions
        balance ← balance + x
        kept ← kept + 1
        IF x < 0 THEN push (x, p) onto negatives
        IF balance < 0 THEN
            (y, q) ← pop smallest from negatives
            balance ← balance - y
            kept ← kept - 1
            mark position q as dropped
    RETURN kept`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = key => {
  const index = code.findIndex(entry => entry.text.includes(key))
  if (index < 0) throw new Error(`Missing pseudocode line: ${key}`)
  return index + 1
}

export const python = `import heapq


def max_retained(transactions):
    balance = 0
    kept = 0
    negatives = []
    for p, x in enumerate(transactions):
        balance += x
        kept += 1
        if x < 0:
            heapq.heappush(negatives, (x, p))
        if balance < 0:
            y, q = heapq.heappop(negatives)
            balance -= y
            kept -= 1
    return kept


if __name__ == "__main__":
    import json
    import sys
    print(json.dumps(max_retained(json.loads(sys.stdin.read()))))
`

const PY_LINES = python.split('\n')
const P = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing python line: ${key}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Start', description: 'Begin at balance zero with nothing kept.' },
  { id: 'take', label: 'Take', description: 'Keep the next transaction and update the balance.' },
  { id: 'remember', label: 'Remember', description: 'Store a negative transaction as a drop candidate.' },
  { id: 'drop', label: 'Drop', description: 'Balance went negative: remove the most negative kept amount.' },
  { id: 'done', label: 'Answer', description: 'Report how many transactions survived.' },
]

export function parseInput(text) {
  const transactions = JSON.parse(text)
  if (!Array.isArray(transactions) || transactions.length > 14) throw new Error('Use a list of at most 14 signed integers.')
  if (!transactions.every(x => Number.isInteger(x) && x >= -50 && x <= 50)) throw new Error('Each transaction is an integer from -50 to 50.')
  return transactions
}

export function buildTrace(transactions) {
  const frames = []
  let balance = 0
  let kept = 0
  let negatives = []
  const status = transactions.map(() => 'pending')
  const cmp = (a, b) => (a[0] - b[0]) || (a[1] - b[1])
  const push = (phase, line, py, message, extra = {}) => frames.push({
    phase, activeLine: L(line), pythonLine: P(py), message, balance, kept,
    status: [...status], heap: negatives.map(([amount, position]) => ({ amount, position })).sort(cmp),
    current: -1, dropped: -1, ...extra,
  })
  push('start', 'balance ← 0; kept ← 0', 'balance = 0', 'Start at balance zero with nothing kept.')
  transactions.forEach((x, p) => {
    balance += x
    kept += 1
    status[p] = 'kept'
    push('take', 'balance ← balance + x', 'balance += x', `Keep transaction ${p} (${x}); balance is ${balance}.`, { current: p })
    if (x < 0) {
      negatives.push([x, p])
      negatives.sort(cmp)
      push('remember', 'IF x < 0 THEN push', 'heapq.heappush', `${x} is negative: remember it as a drop candidate.`, { current: p })
    }
    if (balance < 0) {
      const [y, q] = negatives.shift()
      balance -= y
      kept -= 1
      status[q] = 'dropped'
      push('drop', 'IF balance < 0 THEN', 'if balance < 0', `Balance fell below zero. Drop the most negative kept amount ${y} (position ${q}); balance recovers to ${balance}.`, { current: p, dropped: q })
    }
  })
  push('done', 'RETURN kept', 'return kept', `Retained ${kept} of ${transactions.length} transactions.`, { current: -1, dropped: -1 })
  return { input: transactions, result: kept, frames }
}
