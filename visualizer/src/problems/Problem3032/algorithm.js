export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a and b.')
  const { a, b } = input
  if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < a || b > 99999) throw new Error('Use integers with 0 <= a <= b <= 99999.')
  return { a, b }
}

export const code = `count the distinct-digit integers in [a, b] as f(b) minus f(a minus 1)
  define f(x) as the count of integers in [0, x] with all digits different
  if x is less than zero then return 0
  if x is zero then return 1
  set total to 1 for the number zero
  for each shorter length, add 9 times P(9, length minus 1)
  set used to empty
  for each position i of x from the left
    for each digit c below the current digit that is unused, add P(9 minus used count, digits left)
    if the current digit is already used then return total
    mark the current digit as used
  add 1 for x itself and return total
  answer = f(b) minus f(a minus 1)`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const line = code.findIndex(c => c.text.includes(s))
  if (line < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return line + 1
}

export const python = `def perm(n, k):
    result = 1
    for t in range(k):
        result *= n - t
    return result

def count_distinct(x):
    if x < 0:
        return 0
    if x == 0:
        return 1
    s = str(x)
    n = len(s)
    total = 1
    for length in range(1, n):
        total += 9 * perm(9, length - 1)
    used = set()
    for i in range(n):
        d = int(s[i])
        for c in range(1 if i == 0 else 0, d):
            if c not in used:
                total += perm(9 - len(used), n - i - 1)
        if d in used:
            return total
        used.add(d)
    return total + 1

def count_between(a, b):
    return count_distinct(b) - count_distinct(a - 1)
`

const PY = python.split('\n')
const P = s => {
  const line = PY.findIndex(text => text.includes(s))
  if (line < 0) throw new Error(`Missing python line: ${s}`)
  return line + 1
}

function perm(n, k) {
  let result = 1
  for (let t = 0; t < k; t++) result *= n - t
  return result
}

export function buildTrace({ a, b }) {
  const frames = []
  let total = 0
  let result = 0

  const emit = fields => frames.push({
    part: '', x: null, digits: '', pos: -1, digit: null, used: [], cands: [], added: 0, stopped: false, total, answer: null, ...fields,
  })

  // Counts integers in [0, x] with distinct digits, labelled with the bound it came from.
  const count = (x, part) => {
    if (x < 0) {
      emit({ phase: 'zero', part, x, pythonLine: P('if x < 0:'), activeLine: L('if x is less than zero'), message: `${part} is below zero, so this count is 0.` })
      return 0
    }
    if (x === 0) {
      emit({ phase: 'zero', part, x, digits: '0', total: 1, pythonLine: P('if x == 0:'), activeLine: L('if x is zero'), message: `Only 0 is in [0, 0], and it has distinct digits.` })
      return 1
    }
    const s = String(x)
    const n = s.length
    let sum = 1
    emit({ phase: 'zero', part, x, digits: s, total: sum, pythonLine: P('total = 1'), activeLine: L('set total to 1'), message: `Start ${part} with 1 for the number 0.` })
    for (let len = 1; len < n; len++) {
      const added = 9 * perm(9, len - 1)
      sum += added
      emit({ phase: 'short', part, x, digits: s, added, total: sum, pythonLine: P('total += 9 * perm(9, length - 1)'), activeLine: L('for each shorter length'), message: `All ${len}-digit numbers with distinct digits are below ${s}: +${added}.` })
    }
    const used = []
    for (let i = 0; i < n; i++) {
      const d = Number(s[i])
      const cands = []
      let added = 0
      for (let c = i === 0 ? 1 : 0; c < d; c++) {
        if (!used.includes(c)) {
          cands.push(c)
          added += perm(9 - used.length, n - i - 1)
        }
      }
      sum += added
      emit({
        phase: 'choose', part, x, digits: s, pos: i, digit: d, used: used.slice(), cands, added, total: sum,
        pythonLine: P('for c in range(1 if i == 0 else 0, d):'), activeLine: L('for each digit c below'),
        message: cands.length
          ? `Position ${i} is ${d}. Smaller unused digits ${cands.join(', ')} each leave ${n - i - 1} free place${n - i - 1 === 1 ? '' : 's'}: +${added}.`
          : `Position ${i} is ${d}. No smaller unused digit is available here.`,
      })
      if (used.includes(d)) {
        emit({ phase: 'stop', part, x, digits: s, pos: i, digit: d, used: used.slice(), total: sum, stopped: true, pythonLine: P('if d in used:'), activeLine: L('if the current digit is already used'), message: `${d} repeats, so no number with this prefix can have distinct digits.` })
        return sum
      }
      used.push(d)
      emit({ phase: 'mark', part, x, digits: s, pos: i, digit: d, used: used.slice(), total: sum, pythonLine: P('used.add(d)'), activeLine: L('mark the current digit as used'), message: `Keep ${d} as part of the prefix; used digits are ${used.join(', ')}.` })
    }
    sum += 1
    emit({ phase: 'finish', part, x, digits: s, used: used.slice(), total: sum, pythonLine: P('return total + 1'), activeLine: L('add 1 for x itself'), message: `${s} itself has distinct digits: +1.` })
    return sum
  }

  emit({ phase: 'start', part: 'b', x: b, digits: String(b), pythonLine: P('def count_between(a, b):'), activeLine: L('count the distinct-digit integers'), message: `Count distinct-digit integers in [${a}, ${b}] as f(${b}) minus f(${a - 1}).` })
  const hi = count(b, 'b')
  const lo = count(a - 1, 'a-1')
  result = hi - lo
  emit({ phase: 'done', part: 'answer', x: b, digits: String(b), total: result, answer: result, pythonLine: P('return count_distinct(b) - count_distinct(a - 1)'), activeLine: L('answer = f(b) minus f(a minus 1)'), message: `f(${b}) = ${hi} and f(${a - 1}) = ${lo}, so the answer is ${result}.` })
  return { input: { a, b }, result, frames }
}
