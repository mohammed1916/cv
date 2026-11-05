// LeetCode 2166: Design Bitset.
// Keep the bits relative to a global flip flag: logical bit = stored bit XOR flip.
// A cached count of logical ones makes all, one and count O(1); flip only toggles the flag.

const MAX_SIZE = 16
const MAX_OPS = 24

export function parseInput(text) {
  let spec
  try { spec = JSON.parse(text) } catch { throw new Error('Use JSON like {"size":4,"ops":[["fix",1],["flip"],["count"]]}.') }
  if (!spec || !Number.isInteger(spec.size) || spec.size < 1 || spec.size > MAX_SIZE) throw new Error(`size must be an integer from 1 to ${MAX_SIZE}.`)
  if (!Array.isArray(spec.ops) || spec.ops.length < 1 || spec.ops.length > MAX_OPS) throw new Error(`Use 1 to ${MAX_OPS} operations.`)
  const ops = spec.ops.map((op, i) => {
    if (!Array.isArray(op) || typeof op[0] !== 'string') throw new Error(`Operation ${i} must start with a name.`)
    const [name, ...args] = op
    const needsIndex = name === 'fix' || name === 'unfix'
    if (needsIndex && (args.length !== 1 || !Number.isInteger(args[0]) || args[0] < 0 || args[0] >= spec.size)) throw new Error(`${name} needs one index from 0 to ${spec.size - 1}.`)
    if (!needsIndex && !['flip', 'all', 'one', 'count', 'toString'].includes(name)) throw new Error(`Unknown operation ${name}.`)
    if (!needsIndex && args.length) throw new Error(`${name} takes no arguments.`)
    return { name, args }
  })
  return { size: spec.size, ops }
}

export const code = `FUNCTION runBitset(size, ops)
    raw ← array of size zeros
    flip ← 0
    ones ← 0
    FOR each operation op
        IF op is fix(i) AND logical(i) is 0 THEN
            raw[i] ← raw[i] XOR 1
            ones ← ones + 1
        IF op is unfix(i) AND logical(i) is 1 THEN
            raw[i] ← raw[i] XOR 1
            ones ← ones - 1
        IF op is flip THEN
            flip ← flip XOR 1
            ones ← size - ones
        RECORD the returned value of op
    RETURN the recorded values`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def run_bitset(size, ops):
    raw = [0] * size
    flip = 0
    ones = 0
    results = []
    for name, *args in ops:
        if name == "fix" and (raw[args[0]] ^ flip) == 0:
            raw[args[0]] ^= 1
            ones += 1
        elif name == "unfix" and (raw[args[0]] ^ flip) == 1:
            raw[args[0]] ^= 1
            ones -= 1
        elif name == "flip":
            flip ^= 1
            ones = size - ones
        results.append(None if name in ("fix", "unfix", "flip") else
                       (ones == size) if name == "all" else
                       (ones > 0) if name == "one" else
                       ones if name == "count" else
                       "".join(str(raw[i] ^ flip) for i in range(size)))
    return results
`

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

export const phases = [
  { id: 'start', label: 'Empty', description: 'Every bit starts at 0 and the flip flag is off.' },
  { id: 'op', label: 'Operations', description: 'Each operation updates the stored bits, the flag or the count.' },
  { id: 'done', label: 'Results', description: 'All returned values, in order.' },
]

const logical = (raw, flip, i) => raw[i] ^ flip

export function buildTrace({ size, ops }) {
  const raw = Array(size).fill(0)
  let flip = 0
  let ones = 0
  const results = []
  const frames = []
  const snapshot = (phase, index, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, index, activeLine, pythonLine, message, raw: raw.slice(), flip, ones, size,
    bits: raw.map((_, i) => logical(raw, flip, i)), results: results.slice(), ...extra,
  })
  snapshot('start', -1, L('raw ← array'), P('raw = [0]'), `${size} bits, all 0. The flag is 0 and the count is 0.`)
  ops.forEach((op, index) => {
    const [i] = op.args
    let changed = false
    let returned = null
    let activeLine
    let pythonLine
    if (op.name === 'fix') {
      activeLine = L('IF op is fix'); pythonLine = P('name == "fix"')
      if (logical(raw, flip, i) === 0) { raw[i] ^= 1; ones += 1; changed = true }
    } else if (op.name === 'unfix') {
      activeLine = L('IF op is unfix'); pythonLine = P('name == "unfix"')
      if (logical(raw, flip, i) === 1) { raw[i] ^= 1; ones -= 1; changed = true }
    } else if (op.name === 'flip') {
      activeLine = L('IF op is flip'); pythonLine = P('name == "flip"')
      flip ^= 1; ones = size - ones; changed = true
    } else if (op.name === 'all') {
      activeLine = L('RECORD'); pythonLine = P('results.append')
      returned = ones === size
    } else if (op.name === 'one') {
      activeLine = L('RECORD'); pythonLine = P('results.append')
      returned = ones > 0
    } else if (op.name === 'count') {
      activeLine = L('RECORD'); pythonLine = P('results.append')
      returned = ones
    } else {
      activeLine = L('RECORD'); pythonLine = P('results.append')
      returned = raw.map((_, k) => logical(raw, flip, k)).join('')
    }
    if (!['fix', 'unfix', 'flip'].includes(op.name)) { /* query only */ } else returned = null
    results.push(returned)
    const text = op.name === 'toString' ? `toString returns ${returned}.` : `${op.name}${op.args.length ? `(${i})` : '()'} returns ${JSON.stringify(returned)}.`
    snapshot('op', index, activeLine, pythonLine,
      `${text} ${changed ? 'The state changed.' : 'The state did not change.'} Logical ones: ${ones}.`,
      { op: op.name, opIndex: index, changed, returned, touched: op.args.length ? i : -1 })
  })
  snapshot('done', ops.length, L('RETURN the recorded'), P('return results'), 'Every operation has been applied; the returned values are listed in order.')
  return { input: { size, ops }, result: results, frames }
}
