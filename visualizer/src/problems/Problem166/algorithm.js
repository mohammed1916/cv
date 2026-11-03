export const phases = [
  { id: 'start', label: 'Start', description: 'A zero numerator gives "0". Otherwise the sign depends on whether exactly one input is negative; work with the magnitudes.' },
  { id: 'integer', label: 'Integer part', description: 'Divide the magnitudes. The quotient is the integer part and the remainder starts the fractional digits.' },
  { id: 'digit', label: 'Fraction digits', description: 'Multiply the remainder by 10 and divide again. The quotient is the next digit; the new remainder continues the process.' },
  { id: 'cycle', label: 'Repeat found', description: 'A remainder seen before means the digits from its first position onward repeat forever, so wrap them in parentheses.' },
  { id: 'done', label: 'Build string', description: 'Join the sign, integer part, fraction digits and any repeating group.' },
]

const codeText = `fraction to decimal (numerator, denominator):
  if numerator is 0: return "0"
  sign is negative when exactly one input is negative
  split |numerator| into whole and remainder
  if remainder is 0: return sign and whole
  seen = empty map from remainder to digit position
  while remainder is not 0 and remainder is not in seen:
    seen[remainder] = digits so far
    remainder = remainder * 10
    append remainder div denominator as a digit
    remainder = remainder mod denominator
  if remainder is 0: return whole . digits
  return whole . digits before seen[remainder] ( digits from there )`

export const code = codeText.split('\n').map((text, index) => ({ line: index + 1, text }))

const pythonText = `def fraction_to_decimal(numerator, denominator):
    if numerator == 0:
        return "0"
    sign = "-" if (numerator < 0) != (denominator < 0) else ""
    numerator, denominator = abs(numerator), abs(denominator)
    whole, remainder = divmod(numerator, denominator)
    if remainder == 0:
        return sign + str(whole)
    digits = []
    seen = {}
    while remainder != 0 and remainder not in seen:
        seen[remainder] = len(digits)
        remainder *= 10
        digits.append(str(remainder // denominator))
        remainder %= denominator
    if remainder == 0:
        return sign + str(whole) + "." + "".join(digits)
    start = seen[remainder]
    return sign + str(whole) + "." + "".join(digits[:start]) + "(" + "".join(digits[start:]) + ")"
`

export const python = pythonText
const L = s => codeText.split('\n').findIndex(line => line.includes(s)) + 1
const P = s => pythonText.split('\n').findIndex(line => line.includes(s)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"numerator": 1, "denominator": 3}.')
  const { numerator, denominator } = input
  const limit = 2147483647
  if (!Number.isInteger(numerator) || Math.abs(numerator) > limit) throw new Error('numerator is an integer within 32-bit signed range.')
  if (!Number.isInteger(denominator) || Math.abs(denominator) > limit || denominator === 0) throw new Error('denominator is a non-zero integer within 32-bit signed range.')
  return { numerator, denominator }
}

export function buildTrace({ numerator, denominator }) {
  const frames = []
  const negative = numerator !== 0 && (numerator < 0) !== (denominator < 0)
  const sign = negative ? '-' : ''
  const snap = extra => ({ whole: null, digits: '', remainder: null, seen: [], cycleStart: null, ...extra })
  frames.push({
    phase: 'start', activeLine: L('fraction to decimal'), pythonLine: P('def fraction_to_decimal'),
    snapshot: snap({}),
    message: `${numerator} / ${denominator}: ${negative ? 'the result is negative' : 'the result is not negative'}.`,
  })

  if (numerator === 0) {
    frames.push({ phase: 'done', activeLine: L('if numerator is 0'), pythonLine: P('return "0"'), snapshot: snap({}), message: 'Zero divided by anything is "0".' })
    return { input: { numerator, denominator }, result: '0', frames }
  }

  const n = Math.abs(numerator)
  const d = Math.abs(denominator)
  const whole = Math.floor(n / d)
  let remainder = n % d
  frames.push({
    phase: 'integer', activeLine: L('split |numerator|'), pythonLine: P('whole, remainder = divmod'),
    snapshot: snap({ whole, remainder }),
    message: `Integer part ${whole}, remainder ${remainder}.`,
  })

  if (remainder === 0) {
    const result = `${sign}${whole}`
    frames.push({ phase: 'done', activeLine: L('return sign and whole'), pythonLine: P('return sign + str(whole)'), snapshot: snap({ whole, remainder }), message: `The division is exact, so the answer is ${result}.` })
    return { input: { numerator, denominator }, result, frames }
  }

  const digits = []
  const seen = new Map()
  const seenList = () => [...seen].map(([value, position]) => ({ remainder: value, position }))
  while (remainder !== 0 && !seen.has(remainder)) {
    const before = remainder
    seen.set(remainder, digits.length)
    const scaled = remainder * 10
    const digit = Math.floor(scaled / d)
    digits.push(String(digit))
    remainder = scaled % d
    frames.push({
      phase: 'digit', activeLine: L('append remainder div'), pythonLine: P('digits.append'),
      snapshot: snap({ whole, digits: digits.join(''), remainder, seen: seenList() }),
      message: `Remainder ${before} is recorded at position ${digits.length - 1}. Times 10 gives digit ${digit} and remainder ${remainder}.`,
    })
  }

  let result
  if (remainder === 0) {
    result = `${sign}${whole}.${digits.join('')}`
    frames.push({ phase: 'done', activeLine: L('if remainder is 0: return whole'), pythonLine: P('return sign + str(whole) + "." + "".join(digits)'), snapshot: snap({ whole, digits: digits.join(''), remainder, seen: seenList() }), message: `The remainder reached 0, so the decimal terminates: ${result}.` })
  } else {
    const start = seen.get(remainder)
    result = `${sign}${whole}.${digits.slice(0, start).join('')}(${digits.slice(start).join('')})`
    frames.push({ phase: 'cycle', activeLine: L('remainder is not in seen'), pythonLine: P('while remainder != 0'), snapshot: snap({ whole, digits: digits.join(''), remainder, seen: seenList(), cycleStart: start }), message: `Remainder ${remainder} was already seen at position ${start}, so those digits repeat.` })
    frames.push({ phase: 'done', activeLine: L('return whole . digits before'), pythonLine: P('start = seen[remainder]'), snapshot: snap({ whole, digits: digits.join(''), remainder, seen: seenList(), cycleStart: start }), message: `Return ${result}.` })
  }
  return { input: { numerator, denominator }, result, frames }
}
