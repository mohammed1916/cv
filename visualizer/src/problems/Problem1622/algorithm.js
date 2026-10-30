const MOD = 1000000007n

function powMod(base, exp) {
  let result = 1n
  let b = ((base % MOD) + MOD) % MOD
  let e = exp
  while (e > 0n) {
    if (e & 1n) result = (result * b) % MOD
    b = (b * b) % MOD
    e >>= 1n
  }
  return result
}

const OPS = ['append', 'addAll', 'multAll', 'getIndex']

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.ops)) {
    throw new Error('Use an object with an ops array, for example {"ops":[["append",2],["addAll",3],["getIndex",0]]}.')
  }
  if (data.ops.length < 1 || data.ops.length > 40) throw new Error('ops must have 1 to 40 operations.')
  data.ops.forEach((op, i) => {
    if (!Array.isArray(op) || op.length !== 2 || !OPS.includes(op[0]) || !Number.isInteger(op[1])) {
      throw new Error(`Operation ${i + 1} must be [name, integer] with name append, addAll, multAll or getIndex.`)
    }
    const [name, arg] = op
    if (name === 'getIndex') {
      if (arg < 0 || arg > 100000) throw new Error(`Operation ${i + 1}: getIndex index must be 0 to 100000.`)
    } else if (arg < 1 || arg > 100) {
      throw new Error(`Operation ${i + 1}: ${name} value must be 1 to 100.`)
    }
  })
  if (!data.ops.some(([name]) => name === 'append' || name === 'getIndex' || name === 'addAll' || name === 'multAll')) {
    throw new Error('Add at least one operation.')
  }
  return { ops: data.ops.map(([name, arg]) => [name, arg]) }
}

export function buildTrace(input) {
  // stored[i] is kept so that the real value is (stored[i] * mul + add) mod p.
  const stored = []
  let mul = 1n
  let add = 0n
  const results = []
  const frames = []
  const snapshot = () => stored.map(v => Number((v * mul + add) % MOD))
  const pack = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase,
    activeLine,
    pythonLine,
    message,
    length: stored.length,
    values: snapshot(),
    stored: stored.map(v => Number(v)),
    mul: Number(mul),
    add: Number(add),
    results: [...results],
    ...extra,
  })

  pack('start', 2, 1, `Start with an empty sequence, multiplier 1 and offset 0. Values are stored as raw numbers and the real value is raw * multiplier + offset.`)
  input.ops.forEach(([name, arg], index) => {
    const step = index + 1
    if (name === 'append') {
      const raw = ((BigInt(arg) - add) % MOD + MOD) % MOD * powMod(mul, MOD - 2n) % MOD
      stored.push(raw)
      pack('append', 5, 23, `Operation ${step}: append ${arg}. Stored raw ${Number(raw)} so that it reads ${arg} right now.`, { op: name, arg, index: stored.length - 1 })
    } else if (name === 'addAll') {
      add = (add + BigInt(arg)) % MOD
      pack('addAll', 7, 25, `Operation ${step}: addAll ${arg}. The offset grows to ${Number(add)}. No stored value is touched.`, { op: name, arg })
    } else if (name === 'multAll') {
      mul = mul * BigInt(arg) % MOD
      add = add * BigInt(arg) % MOD
      pack('multAll', 9, 27, `Operation ${step}: multAll ${arg}. The multiplier becomes ${Number(mul)} and the offset becomes ${Number(add)}.`, { op: name, arg })
    } else {
      if (arg >= stored.length) {
        results.push(-1)
        pack('getIndex', 11, 29, `Operation ${step}: getIndex ${arg} is outside the length ${stored.length}, so the answer is -1.`, { op: name, arg, answer: -1 })
      } else {
        const answer = Number((stored[arg] * mul + add) % MOD)
        results.push(answer)
        pack('getIndex', 12, 29, `Operation ${step}: getIndex ${arg} applies the transform to raw ${Number(stored[arg])} and returns ${answer}.`, { op: name, arg, answer })
      }
    }
  })
  pack('done', 13, 30, `Every operation is processed. The getIndex answers are [${results.join(', ')}].`, { done: true })
  return { input, result: results, frames }
}

export const code = `fancy sequence (ops):
  start with an empty sequence, multiplier 1 and offset 0
  for each operation in order
    if the operation is append(val)
      store (val - offset) divided by multiplier, modulo p
    if the operation is addAll(inc)
      add inc to the offset
    if the operation is multAll(m)
      multiply the multiplier and the offset by m
    if the operation is getIndex(idx)
      if idx is at least the length, the answer is -1
      else the answer is stored[idx] times multiplier plus offset, modulo p
  return the list of answers`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `MOD = 10**9 + 7
class Fancy:
    def __init__(self):
        self.stored = []
        self.mul = 1
        self.add = 0
    def append(self, val):
        self.stored.append((val - self.add) * pow(self.mul, MOD - 2, MOD) % MOD)
    def addAll(self, inc):
        self.add = (self.add + inc) % MOD
    def multAll(self, m):
        self.mul = self.mul * m % MOD
        self.add = self.add * m % MOD
    def getIndex(self, idx):
        if idx >= len(self.stored):
            return -1
        return (self.stored[idx] * self.mul + self.add) % MOD
def fancy_sequence(ops):
    f = Fancy()
    out = []
    for name, arg in ops:
        if name == "append":
            f.append(arg)
        elif name == "addAll":
            f.addAll(arg)
        elif name == "multAll":
            f.multAll(arg)
        else:
            out.append(f.getIndex(arg))
    return out
`
