export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with an empty sequence, multiplier 1 and offset 0, all modulo a prime.' },
  { id: 'append', label: 'Append', description: 'Store the value divided by the current multiplier, so that the transform gives back the real value.' },
  { id: 'addAll', label: 'addAll', description: 'Add to the offset instead of touching every stored value.' },
  { id: 'multAll', label: 'multAll', description: 'Scale the multiplier and the offset instead of touching every stored value.' },
  { id: 'getIndex', label: 'getIndex', description: 'Apply the multiplier and offset to the stored value at the index.' },
  { id: 'done', label: 'Complete', description: 'Report every getIndex answer in order.' },
]

const MOD = 1000000007n
const OP_NAMES = ['append', 'addAll', 'multAll', 'getIndex']

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || !Array.isArray(input.ops)) throw new Error('Use an object such as {"ops": [["append", 2], ["addAll", 3], ["getIndex", 0]]}.')
  if (input.ops.length < 1 || input.ops.length > 40) throw new Error('Give between 1 and 40 operations.')
  const ops = input.ops.map((entry, index) => {
    if (!Array.isArray(entry) || entry.length !== 2) throw new Error(`Operation ${index + 1} must be a [name, value] pair.`)
    const [name, value] = entry
    if (!OP_NAMES.includes(name)) throw new Error(`Operation ${index + 1}: name must be append, addAll, multAll or getIndex.`)
    if (!Number.isInteger(value)) throw new Error(`Operation ${index + 1}: the value must be an integer.`)
    if (name === 'getIndex' && value < 0) throw new Error(`Operation ${index + 1}: an index cannot be negative.`)
    if ((name === 'append' || name === 'addAll') && (value < 0 || value >= 1000000007)) throw new Error(`Operation ${index + 1}: values run from 0 to 1000000006.`)
    if (name === 'multAll' && (value < 1 || value > 1000)) throw new Error(`Operation ${index + 1}: multAll uses a factor from 1 to 1000.`)
    return [name, value]
  })
  return { ops }
}

// Lines of the solver the story points at (1-based, matching `code` below).
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(line => line.includes(s)) + 1

const powMod = (base, exp) => {
  let result = 1n, b = base % MOD, e = exp
  while (e > 0n) { if (e & 1n) result = (result * b) % MOD; b = (b * b) % MOD; e >>= 1n }
  return result
}

export function buildTrace({ ops }) {
  const frames = []
  const at = (pseudo, py) => ({ activeLine: L(pseudo), pythonLine: P(py) })
  const raw = []          // stored values, each divided by the multiplier at the time it was appended
  let mul = 1n, add = 0n  // one shared multiplier and offset for the whole sequence
  const answers = []
  const real = () => raw.map(r => Number((r * mul + add) % MOD))
  const snap = (op, arg, message) => ({ op, arg, mul: Number(mul), add: Number(add), stored: raw.map(Number), values: real(), results: [...answers], done: false, message })

  frames.push({ phase: 'start', ...at('seq = empty list', 'MOD = 10**9 + 7'),
    message: 'The sequence is empty, the multiplier is 1 and the offset is 0.', snapshot: snap('start', null, 'Start') })

  ops.forEach(([name, value], index) => {
    if (name === 'append') {
      const stored = ((BigInt(value) - add) % MOD + MOD) % MOD * powMod(mul, MOD - 2n) % MOD
      raw.push(stored)
      frames.push({ phase: 'append', ...at('if name is append', "if name == 'append'"),
        message: `Append ${value}. Stored as ${Number(stored)} so that ${Number(stored)} * ${Number(mul)} + ${Number(add)} gives ${value} modulo the prime.`,
        snapshot: snap(name, value, `Append ${value}`) })
    } else if (name === 'addAll') {
      add = (add + BigInt(value)) % MOD
      frames.push({ phase: 'addAll', ...at('if name is addAll', "elif name == 'addAll'"),
        message: `addAll ${value}: the offset becomes ${Number(add)}. No stored value is touched.`, snapshot: snap(name, value, 'addAll') })
    } else if (name === 'multAll') {
      mul = mul * BigInt(value) % MOD
      add = add * BigInt(value) % MOD
      frames.push({ phase: 'multAll', ...at('if name is multAll', "elif name == 'multAll'"),
        message: `multAll ${value}: the multiplier becomes ${Number(mul)} and the offset ${Number(add)}. Still no stored value is touched.`, snapshot: snap(name, value, 'multAll') })
    } else {
      const answer = value >= raw.length ? -1 : Number((raw[value] * mul + add) % MOD)
      answers.push(answer)
      frames.push({ phase: 'getIndex', ...at('if name is getIndex', 'answers.append(-1'),
        message: answer === -1 ? `getIndex ${value}: there is no element at that index, so the answer is -1.` : `getIndex ${value}: stored ${Number(raw[value])} times ${Number(mul)}, plus ${Number(add)}, gives ${answer}.`,
        snapshot: snap(name, value, 'getIndex') })
    }
  })

  frames.push({ phase: 'done', ...at('return answers', 'return answers'),
    message: `Answers in order: [${answers.join(', ')}].`, snapshot: { ...snap(null, null, 'Complete'), results: [...answers], done: true } })
  return { input: { ops }, result: answers, frames }
}

export const code = `fancy sequence (ops):
  seq = empty list of raw values
  mul, add = 1, 0
  for name, x in ops:
    if name is append: push (x - add) / mul
    if name is addAll: add = add + x
    if name is multAll: mul, add = mul * x, add * x
    if name is getIndex: answer -1 if x >= len(seq), else seq[x] * mul + add
  return answers`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def fancy_ops(ops):
    MOD = 10**9 + 7
    seq, mul, add, answers = [], 1, 0, []
    for name, x in ops:
        if name == 'append':
            seq.append((x - add) * pow(mul, MOD - 2, MOD) % MOD)
        elif name == 'addAll':
            add = (add + x) % MOD
        elif name == 'multAll':
            mul = mul * x % MOD
            add = add * x % MOD
        else:
            answers.append(-1 if x >= len(seq) else (seq[x] * mul + add) % MOD)
    return answers
`
