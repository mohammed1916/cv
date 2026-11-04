// LeetCode 4039: Sum of Decoded Numbers.
// Each encoded integer e carries its split width in its last digit. Drop that digit, then the first
// `width` digits form x and the rest form y. The answer is the sum of x^y modulo 1000000007.
// x^y is computed by repeated squaring with BigInt, so no intermediate product overflows.
// The note's bounds (length 1..100000, 100 < e < 10^15) are used for parsing; the visualization
// caps the array at 8 values because every power is shown bit by bit.

const MOD = 1000000007n
const MAX_VISUAL_VALUES = 8

const PYTHON_SOURCE = `MOD = 1000000007

def pow_mod(base, exp):
    result = 1
    base %= MOD
    while exp > 0:
        if exp & 1:
            result = result * base % MOD
        base = base * base % MOD
        exp >>= 1
    return result

def sum_of_decoded(nums):
    total = 0
    for e in nums:
        text = str(e)
        width = int(text[-1])
        body = text[:-1]
        x = int(body[:width])
        y = int(body[width:])
        total = (total + pow_mod(x, y)) % MOD
    return total

if __name__ == "__main__":
    import sys, json
    print(sum_of_decoded(json.loads(sys.stdin.read())))
`

export const code = `const MOD = 1000000007n
function powMod(base, exp) {
  // result starts at 1
  let result = 1n
  base %= MOD
  while (exp > 0n) {
    // if exp is odd then multiply the result by base
    if (exp & 1n) result = (result * base) % MOD
    // base times itself, modulo MOD
    base = (base * base) % MOD
    exp >>= 1n
  }
  return result
}
function sumOfDecoded(nums) {
  // total starts at 0
  let total = 0n
  for (const e of nums) {
    const text = String(e)
    // width is the last digit, and body is e without that digit
    const width = Number(text.slice(-1))
    const body = text.slice(0, -1)
    const x = BigInt(body.slice(0, width))
    const y = BigInt(body.slice(width))
    // add powMod(x, y) to total, modulo MOD
    total = (total + powMod(x, y)) % MOD
  }
  // return total
  return total
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}
const PY = PYTHON_SOURCE.split('\n')
const P = s => {
  const index = PY.findIndex(text => text.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export const python = PYTHON_SOURCE

export function decode(e) {
  const text = String(e)
  const width = Number(text.slice(-1))
  const body = text.slice(0, -1)
  return { text, width, x: body.slice(0, width), y: body.slice(width) }
}

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 100000) throw new Error('Use a JSON array of 1 to 100000 integers.')
  for (const e of nums) {
    if (!Number.isSafeInteger(e) || e <= 100 || e >= 1e15) throw new Error('Each encoded value is an integer with 100 < value < 10^15.')
    const { width, x, y } = decode(e)
    if (width < 1 || width > 9) throw new Error('The last digit of each encoded value is a width from 1 to 9.')
    if (y.length === 0 || x.length === 0 || x[0] === '0' || y[0] === '0') throw new Error(`Encoding ${e} must split into two parts without leading zeros.`)
    if (Number(x) < 1 || Number(y) < 1 || Number(x) >= 1e9 || Number(y) >= 1e9) throw new Error(`Encoding ${e} must decode to 1 <= x, y < 10^9.`)
  }
  return { nums }
}

export function buildTrace({ nums }) {
  if (nums.length > MAX_VISUAL_VALUES) throw new Error(`The visualization caps the array at ${MAX_VISUAL_VALUES} values.`)
  const frames = []
  let total = 0n
  frames.push({ phase: 'setup', pythonLine: P('total = 0'), activeLine: L('total starts at 0'), index: -1, e: null, width: null, x: null, y: null,
    power: null, total: 0, message: `Decode ${nums.length} encoded value${nums.length === 1 ? '' : 's'}; the running sum starts at 0.` })

  nums.forEach((e, index) => {
    const { width, x, y } = decode(e)
    frames.push({ phase: 'split', pythonLine: P('width = int(text[-1])'), activeLine: L('width is the last digit'), index, e, width, x, y,
      power: null, total: Number(total), message: `${e}: last digit ${width} is the width. Parts x = ${x} and y = ${y}.` })

    // powMod(x, y) with the bits of y walked from the least significant end.
    let base = BigInt(x) % MOD
    let exp = BigInt(y)
    let result = 1n
    frames.push({ phase: 'power', pythonLine: P('result = 1'), activeLine: L('result starts at 1'), index, e, width, x, y,
      power: { bit: null, exp: exp.toString(), base: base.toString(), result: result.toString() }, total: Number(total),
      message: `Compute ${x}^${y} mod 1000000007 by squaring.` })
    while (exp > 0n) {
      const odd = (exp & 1n) === 1n
      if (odd) result = (result * base) % MOD
      frames.push({ phase: 'power', pythonLine: P(odd ? 'result = result * base' : 'if exp & 1'), activeLine: L('exp is odd'), index, e, width, x, y,
        power: { bit: odd ? 1 : 0, exp: exp.toString(), base: base.toString(), result: result.toString() }, total: Number(total),
        message: odd ? `Exponent bit is 1, so multiply result by base: result is ${result}.` : 'Exponent bit is 0, so the result is unchanged.' })
      base = (base * base) % MOD
      exp >>= 1n
      frames.push({ phase: 'power', pythonLine: P('base = base * base'), activeLine: L('base times itself'), index, e, width, x, y,
        power: { bit: null, exp: exp.toString(), base: base.toString(), result: result.toString() }, total: Number(total),
        message: `Square the base to ${base}; the exponent halves to ${exp}.` })
    }
    total = (total + result) % MOD
    frames.push({ phase: 'add', pythonLine: P('total = (total + pow_mod'), activeLine: L('add powMod(x, y)'), index, e, width, x, y,
      power: { bit: null, exp: '0', base: null, result: result.toString() }, total: Number(total),
      message: `${x}^${y} mod 1000000007 = ${result}. Running total ${total}.` })
  })
  frames.push({ phase: 'done', pythonLine: P('return total'), activeLine: L('return total'), index: -1, e: null, width: null, x: null, y: null,
    power: null, total: Number(total), message: `Sum of decoded powers modulo 1000000007 is ${total}.` })
  return { input: { nums }, nums, answer: Number(total), frames }
}

export const pythonLineMap = {}
export const phases = [
  { id: 'setup', label: 'Start sum', description: 'Running sum starts at 0.' },
  { id: 'split', label: 'Split code', description: 'Read the width digit and split the rest into x and y.' },
  { id: 'power', label: 'Power by squaring', description: 'Walk the bits of y, squaring the base each step.' },
  { id: 'add', label: 'Add term', description: 'Add x^y mod 1000000007 to the running sum.' },
  { id: 'done', label: 'Answer', description: 'Report the sum modulo 1000000007.' },
]
