const DENOMS = [20, 50, 100, 200, 500]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.ops)) throw new Error('Use an object with an ops list.')
  if (input.ops.length < 1 || input.ops.length > 12) throw new Error('ops has 1 to 12 calls.')
  const ops = input.ops.map(op => {
    if (op.op === 'deposit') {
      if (!Array.isArray(op.counts) || op.counts.length !== 5 || !op.counts.every(c => Number.isInteger(c) && c >= 0 && c <= 20)) throw new Error('deposit needs five counts from 0 to 20.')
      return { op: 'deposit', counts: op.counts }
    }
    if (op.op === 'withdraw') {
      if (!Number.isInteger(op.amount) || op.amount < 1 || op.amount > 5000) throw new Error('withdraw needs an amount from 1 to 5000.')
      return { op: 'withdraw', amount: op.amount }
    }
    throw new Error('Each call is deposit or withdraw.')
  })
  return { ops }
}

export function buildTrace({ ops }) {
  const counts = [0, 0, 0, 0, 0]
  const log = []
  const frames = []
  const results = []
  ops.forEach((op, i) => {
    if (op.op === 'deposit') {
      op.counts.forEach((c, k) => { counts[k] += c })
      log.push({ name: 'deposit', args: `[${op.counts.join(', ')}]`, returned: 'void' })
      results.push(null)
      frames.push({ pythonLine: PL('def deposit'), phase: 'deposit', activeLine: CL('counts[k] +='), current: i, log: [...log], counts: [...counts], pick: -1, remaining: null, message: `Deposit ${op.counts.join(', ')} notes, in $20 to $500 order.` })
      return
    }
    let remaining = op.amount
    const take = [0, 0, 0, 0, 0]
    frames.push({ pythonLine: PL('def withdraw'), phase: 'withdraw', activeLine: CL('let remaining'), current: i, log: [...log, { name: 'withdraw', args: String(op.amount), returned: '...' }], counts: [...counts], pick: -1, remaining, message: `Withdraw ${op.amount}. Start with the largest notes.` })
    for (let k = DENOMS.length - 1; k >= 0; k--) {
      const used = Math.min(counts[k], Math.floor(remaining / DENOMS[k]))
      take[k] = used
      remaining -= used * DENOMS[k]
      frames.push({ pythonLine: PL('used = min'), phase: 'pick', activeLine: CL('const used'), current: i, log: [...log, { name: 'withdraw', args: String(op.amount), returned: '...' }], counts: [...counts], pick: k, remaining, message: `Use ${used} of the $${DENOMS[k]} note${used === 1 ? '' : 's'}; ${remaining} remains.` })
    }
    if (remaining !== 0) {
      results.push([-1])
      log.push({ name: 'withdraw', args: String(op.amount), returned: '[-1]' })
      frames.push({ pythonLine: PL('return [-1]'), phase: 'reject', activeLine: CL('return [-1]'), current: i, log: [...log], counts: [...counts], pick: -1, remaining, message: `${remaining} cannot be paid with the remaining notes, so nothing is taken.` })
      return
    }
    take.forEach((t, k) => { counts[k] -= t })
    results.push(take)
    log.push({ name: 'withdraw', args: String(op.amount), returned: `[${take.join(', ')}]` })
    frames.push({ pythonLine: PL('return take'), phase: 'accept', activeLine: CL('return take'), current: i, log: [...log], counts: [...counts], pick: -1, remaining: 0, message: `Hand over [${take.join(', ')}] and remove those notes from the machine.` })
  })
  return { input: { ops }, result: results, frames }
}

export const code = `const DENOMS = [20, 50, 100, 200, 500];

class ATM {
  constructor() {
    this.counts = [0, 0, 0, 0, 0];
  }
  deposit(banknotesCount) {
    for (let k = 0; k < 5; k++) this.counts[k] += banknotesCount[k];
  }
  withdraw(amount) {
    let remaining = amount;
    const take = [0, 0, 0, 0, 0];
    for (let k = 4; k >= 0; k--) {
      const used = Math.min(this.counts[k], Math.floor(remaining / DENOMS[k]));
      take[k] = used;
      remaining -= used * DENOMS[k];
    }
    if (remaining !== 0) return [-1];
    for (let k = 0; k < 5; k++) this.counts[k] -= take[k];
    return take;
  }
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `DENOMS = [20, 50, 100, 200, 500]


class ATM:
    def __init__(self):
        self.counts = [0, 0, 0, 0, 0]

    def deposit(self, banknotes_count):
        for k in range(5):
            self.counts[k] += banknotes_count[k]

    def withdraw(self, amount):
        remaining = amount
        take = [0, 0, 0, 0, 0]
        for k in range(4, -1, -1):
            used = min(self.counts[k], remaining // DENOMS[k])
            take[k] = used
            remaining -= used * DENOMS[k]
        if remaining != 0:
            return [-1]
        for k in range(5):
            self.counts[k] -= take[k]
        return take
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
