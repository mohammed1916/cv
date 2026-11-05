export const code = `function minimizeError(prices, target) {
  const SCALE = 1000000
  const micro = prices.map(p => Math.round(parseFloat(p) * SCALE))
  const floorSum = micro.reduce((sum, m) => sum + Math.floor(m / SCALE), 0)
  const ups = target - floorSum
  const fractions = micro.map(m => m % SCALE).filter(f => f !== 0)
  if (ups < 0 || ups > fractions.length) return '-1'
  let error = fractions.reduce((a, b) => a + b, 0)
  const extra = fractions.map(f => SCALE - 2 * f).sort((a, b) => a - b)
  error += extra.slice(0, ups).reduce((a, b) => a + b, 0)
  const thousandths = Math.floor((error + 500) / 1000)
  return \`\${Math.floor(thousandths / 1000)}.\${String(thousandths % 1000).padStart(3, '0')}\`
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `from decimal import Decimal, ROUND_HALF_UP


def minimize_error(prices, target):
    scale = 10 ** 6
    micro = [int(Decimal(p) * scale) for p in prices]
    floor_sum = sum(m // scale for m in micro)
    ups = target - floor_sum
    fractions = [m % scale for m in micro if m % scale != 0]
    if ups < 0 or ups > len(fractions):
        return "-1"
    error = sum(fractions)
    extra = sorted(scale - 2 * f for f in fractions)
    error += sum(extra[:ups])
    return str((Decimal(error) / scale).quantize(Decimal("0.001"), rounding=ROUND_HALF_UP))


if __name__ == "__main__":
    print(minimize_error(["0.700", "2.800", "4.900", "0.000"], 8))
`

const PY_LINES = python.split('\n')
const L = text => {
  const index = code.findIndex(item => item.text.includes(text))
  if (index < 0) throw new Error(`Missing code line: ${text}`)
  return index + 1
}
const P = text => {
  const index = PY_LINES.findIndex(item => item.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

const SCALE = 1000000
const MAX_PRICES = 8
const MAX_INTEGER_DIGITS = 3
const MAX_DECIMALS = 6

export function toMicro(text) {
  const [whole, fraction = ''] = text.split('.')
  return Number(whole) * SCALE + Number((fraction + '000000').slice(0, MAX_DECIMALS))
}

export function formatThousandths(micro) {
  const thousandths = Math.floor((micro + 500) / 1000)
  return `${Math.floor(thousandths / 1000)}.${String(thousandths % 1000).padStart(3, '0')}`
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with prices and target.')
  const { prices, target } = input
  if (!Array.isArray(prices) || prices.length < 1 || prices.length > MAX_PRICES) throw new Error(`Use 1 to ${MAX_PRICES} prices.`)
  const pattern = new RegExp(`^\\d{1,${MAX_INTEGER_DIGITS}}(\\.\\d{1,${MAX_DECIMALS}})?$`)
  if (!prices.every(p => typeof p === 'string' && pattern.test(p))) {
    throw new Error(`Each price is a string like "2.800" with up to ${MAX_INTEGER_DIGITS} integer digits and ${MAX_DECIMALS} decimals.`)
  }
  if (!Number.isInteger(target) || target < 0 || target > prices.length * 999) throw new Error('target is a nonnegative integer.')
  return { prices, target }
}

export function buildTrace({ prices, target }) {
  const rows = prices.map(text => {
    const micro = toMicro(text)
    const floor = Math.floor(micro / SCALE)
    const frac = micro - floor * SCALE
    return { text, floor, frac, delta: frac ? SCALE - 2 * frac : null, choice: frac ? 'down' : 'whole' }
  })
  const frames = []
  const fractional = rows.filter(r => r.frac > 0).length
  const floorSum = rows.reduce((sum, r) => sum + r.floor, 0)
  const ups = target - floorSum
  let error = rows.reduce((sum, r) => sum + r.frac, 0)
  const state = (extra = {}) => ({ rows: rows.map(r => ({ ...r })), floorSum, ups, error, current: -1, result: null, ...extra })
  const add = (phase, line, py, message, extra) => frames.push({ phase, activeLine: L(line), pythonLine: P(py), message, ...state(extra) })
  add('start', 'const floorSum', 'floor_sum = sum', `Rounding every price down gives a floor sum of ${floorSum}; target ${target} needs ${ups} round-up${ups === 1 ? '' : 's'}.`, {})
  rows.forEach((row, index) => add('floor', 'const floorSum', 'micro = [int', `${row.text} rounds down to ${row.floor}, with fractional part ${(row.frac / SCALE).toFixed(6)}.`, { current: index }))
  if (ups < 0 || ups > fractional) {
    add('impossible', "return '-1'", 'return "-1"', `The target needs ${ups} round-ups, but only ${fractional} prices are fractional.`, { result: '-1' })
    return { input: { prices, target }, result: '-1', frames }
  }
  add('need', 'const ups', 'ups = target - floor_sum', `${ups} of the ${fractional} fractional prices must round up.`, {})
  rows.forEach((row, index) => {
    if (row.delta !== null) add('cost', 'const extra', 'extra = sorted', `${row.text}: rounding up adds ${(row.delta / SCALE).toFixed(6)} to the error.`, { current: index })
  })
  const order = rows.map((r, i) => i).filter(i => rows[i].delta !== null).sort((a, b) => rows[a].delta - rows[b].delta || a - b)
  add('sort', '.sort((a, b) => a - b)', 'extra = sorted', 'Cheapest round-up first.', { order: order.slice() })
  for (let k = 0; k < ups; k++) {
    const index = order[k]
    rows[index].choice = 'up'
    error += rows[index].delta
    add('pick', 'error += extra', 'error += sum(extra[:ups])', `Round ${rows[index].text} up; error is now ${(error / SCALE).toFixed(6)}.`, { current: index, order: order.slice(), picked: k + 1 })
  }
  const result = formatThousandths(error)
  add('done', 'return `', 'return str(', `Minimum error is ${result}.`, { result, current: -1, order: order.slice(), picked: ups })
  return { input: { prices, target }, result, frames }
}
