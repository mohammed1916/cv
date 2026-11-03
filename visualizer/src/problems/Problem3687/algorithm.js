// Library late fee calculator.
// Each book's late-day count d is charged once: 1 when d is 1, 2d when d is 2 to 5, and 3d above 5.
// The total charge is the sum over all books.

const CODE_TEXT = `FUNCTION lateFeeTotal(days)
    total ← 0
    FOR each day count d in days
        IF d = 1 THEN fee ← 1
        ELSE IF d ≤ 5 THEN fee ← 2 × d
        ELSE fee ← 3 × d
        total ← total + fee
    RETURN total`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = key => {
  const index = code.findIndex(entry => entry.text.includes(key))
  if (index < 0) throw new Error(`Missing pseudocode line: ${key}`)
  return index + 1
}

export const python = `def late_fee_total(days):
    total = 0
    for d in days:
        if d == 1:
            fee = 1
        elif d <= 5:
            fee = 2 * d
        else:
            fee = 3 * d
        total += fee
    return total


if __name__ == "__main__":
    import json
    import sys
    print(json.dumps(late_fee_total(json.loads(sys.stdin.read()))))
`

const PY_LINES = python.split('\n')
const P = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing python line: ${key}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Books', description: 'Start the running total at zero.' },
  { id: 'tier', label: 'Tier', description: 'Pick the charge rule from the late-day count.' },
  { id: 'add', label: 'Add', description: 'Add this book fee to the total.' },
  { id: 'done', label: 'Total', description: 'Report the total charge.' },
]

export function parseInput(text) {
  const days = JSON.parse(text)
  if (!Array.isArray(days) || days.length > 12) throw new Error('Use a list of at most 12 late-day counts.')
  if (!days.every(d => Number.isInteger(d) && d >= 1 && d <= 60)) throw new Error('Each late-day count is an integer from 1 to 60.')
  return days
}

export function buildTrace(days) {
  const frames = []
  let total = 0
  const fees = []
  const push = (phase, line, py, message, extra = {}) => frames.push({
    phase, activeLine: L(line), pythonLine: P(py), message, total, fees: [...fees], index: -1, days, tier: null, fee: null, ...extra,
  })
  push('start', 'total ← 0', 'total = 0', 'Start the running total at zero.')
  days.forEach((d, index) => {
    if (d === 1) {
      push('tier', 'IF d = 1', 'if d == 1', `Book ${index + 1} is 1 day late: flat charge of 1.`, { index, tier: 'flat', fee: 1 })
    } else if (d <= 5) {
      push('tier', 'ELSE IF d ≤ 5', 'elif d <= 5', `Book ${index + 1} is ${d} days late: 2 × ${d} = ${2 * d}.`, { index, tier: 'double', fee: 2 * d })
    } else {
      push('tier', 'ELSE fee', 'else:', `Book ${index + 1} is ${d} days late: 3 × ${d} = ${3 * d}.`, { index, tier: 'triple', fee: 3 * d })
    }
    const fee = frames[frames.length - 1].fee
    total += fee
    fees.push(fee)
    push('add', 'total ← total + fee', 'total += fee', `Add ${fee}; the running total is now ${total}.`, { index, tier: frames[frames.length - 1].tier, fee })
  })
  push('done', 'RETURN total', 'return total', `Total charge: ${total}.`, { total, index: -1 })
  return { input: days, result: total, frames }
}
