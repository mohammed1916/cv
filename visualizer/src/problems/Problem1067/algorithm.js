const CODE_TEXT = `digit count in range low to high
  return count(high, d) minus count(low minus 1, d)
count(N, d) counts digit d in the numbers 1 to N
  set total to 0
  for each place p = 1, 10, 100 while p is at most N
    high = N // (10 times p), cur = (N // p) mod 10, low = N mod p
    if d is 0
      if high is at least 1 then add (high minus 1) times p, plus p or low plus 1
    otherwise
      add high times p
      if cur is above d then add p
      otherwise if cur equals d then add low plus 1
  return total`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def count_digit(d, low, high):
    def count_upto(n):
        total = 0
        p = 1
        while p <= n:
            high_part = n // (10 * p)
            cur = (n // p) % 10
            low_part = n % p
            if d == 0:
                if high_part >= 1:
                    total += (high_part - 1) * p + (p if cur > 0 else low_part + 1)
            else:
                total += high_part * p
                if cur > d:
                    total += p
                elif cur == d:
                    total += low_part + 1
            p *= 10
        return total

    return count_upto(high) - count_upto(low - 1)


if __name__ == "__main__":
    print(count_digit(1, 1, 13))
`

const PY_LINES = python.split('\n')
const L = text => {
  const index = code.findIndex(item => item.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = PY_LINES.findIndex(item => item.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

const MAX_BOUND = 99999

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with d, low and high.')
  const { d, low, high } = input
  if (!Number.isInteger(d) || d < 0 || d > 9) throw new Error('d is a digit from 0 to 9.')
  if (!Number.isInteger(low) || !Number.isInteger(high) || low < 1 || high > MAX_BOUND || low > high) {
    throw new Error(`Use integers with 1 <= low <= high <= ${MAX_BOUND}.`)
  }
  return { d, low, high }
}

// Occurrences of digit d in 1..n, with the place-by-place rows used by the visualization.
function countWithRows(n, d, frames, add, bound) {
  let total = 0
  const rows = []
  let p = 1
  while (p <= n) {
    const high = Math.floor(n / (10 * p))
    const cur = Math.floor(n / p) % 10
    const low = n % p
    let added = 0
    if (d === 0) {
      if (high >= 1) added = (high - 1) * p + (cur > 0 ? p : low + 1)
    } else {
      added = high * p
      if (cur > d) added += p
      else if (cur === d) added += low + 1
    }
    total += added
    rows.push({ p, high, cur, low, added })
    add('place', d === 0 ? 'if high is at least 1' : 'add high times p', d === 0 ? 'if high_part >= 1' : 'total += high_part * p',
      `Place ${p}: prefix ${high}, digit ${cur}, suffix ${low} adds ${added} occurrence${added === 1 ? '' : 's'} of ${d} for ${bound}.`,
      { bound, n, rows: rows.map(r => ({ ...r })), total, p, high, cur, low })
    p *= 10
  }
  return total
}

export function buildTrace({ d, low, high }) {
  const frames = []
  const add = (phase, line, py, message, extra) => frames.push({
    phase, activeLine: L(line), pythonLine: P(py), message,
    d, low, high, bound: null, n: null, rows: [], total: 0, p: -1, upper: null, lower: null, result: null, ...extra,
  })
  add('start', 'return count(high, d) minus', 'return count_upto(high) - count_upto(low - 1)', `Count digit ${d} in every number from ${low} to ${high}.`, {})
  const upper = countWithRows(high, d, frames, add, `high = ${high}`)
  add('upper', 'return total', 'return count_upto(high)', `count(${high}, ${d}) = ${upper}.`, { bound: 'high', n: high, upper, total: upper, rows: [] })
  const lower = countWithRows(low - 1, d, frames, add, `low - 1 = ${low - 1}`)
  add('lower', 'return count(high, d) minus count(low minus 1', 'return count_upto(high) - count_upto(low - 1)', `count(${low - 1}, ${d}) = ${lower}.`, { bound: 'low-1', n: low - 1, upper, lower, total: lower, rows: [] })
  const result = upper - lower
  add('done', 'return count(high, d) minus count(low minus 1, d)', 'return count_upto(high) - count_upto(low - 1)', `${upper} - ${lower} = ${result} occurrences of ${d}.`, { upper, lower, result })
  return { input: { d, low, high }, result, frames }
}
