export function parseInput(text) {
  const n = JSON.parse(text)
  if (!Number.isInteger(n) || n < 1 || n > 100000) throw new Error('Use an integer from 1 to 100000.')
  return n
}

const perm = (a, b) => (b < 0 || b > a ? 0 : Array.from({ length: b }, (_, i) => a - i).reduce((x, y) => x * y, 1))

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['const perm = (a, b) => (b < 0 || b > a ? 0 : Array.from({ length: b }, (_, i) => a - i).reduce((x, y) => x * y, 1))', 'from math import perm'],
  ['function numDupDigitsAtMostN(n) {', 'def num_dup_digits_at_most_n(n):'],
  ["  const digits = String(n).split('').map(Number)", '    digits = [int(ch) for ch in str(n)]'],
  ['  const len = digits.length', '    length = len(digits)'],
  ['  let unique = 0', '    unique = 0'],
  ['  for (let k = 1; k < len; k++) unique += 9 * perm(9, k - 1)', '    for k in range(1, length): unique += 9 * perm(9, k - 1)'],
  ['  const used = []', '    used = []'],
  ['  let allNew = true', '    all_new = True'],
  ['  for (let i = 0; i < len; i++) { const d = digits[i]', '    for i, d in enumerate(digits):'],
  ['    for (let x = i === 0 ? 1 : 0; x < d; x++) {', '        for x in range(1 if i == 0 else 0, d):'],
  ['      if (!used.includes(x)) unique += perm(9 - used.length, len - i - 1)', '            if x not in used: unique += perm(9 - len(used), length - i - 1)'],
  ['    }', ''],
  ['    if (used.includes(d)) { allNew = false; break }', '        if d in used: all_new = False; break'],
  ['    used.push(d)', '        used.append(d)'],
  ['  }', ''],
  ['  if (allNew) unique += 1', '    if all_new: unique += 1'],
  ['  return n - unique', '    return n - unique'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace(n) {
  const digits = String(n).split('').map(Number)
  const len = digits.length
  let unique = 0
  for (let k = 1; k < len; k++) unique += 9 * perm(9, k - 1)
  const frames = [{ phase: 'start', activeLine: L('for (let k = 1'), pythonLine: P('for k in range'), index: -1, used: [], unique, message: `Numbers with fewer than ${len} digits: ${unique} have all digits distinct. Those are counted in one step.` }]
  const used = []
  let allNew = true
  for (let i = 0; i < len; i++) {
    const d = digits[i]
    for (let x = i === 0 ? 1 : 0; x < d; x++) {
      if (!used.includes(x)) unique += perm(10 - used.length - 1, len - i - 1)
    }
    frames.push({ phase: 'digit', activeLine: L('for (let x = i'), pythonLine: P('for x in range'), index: i, used: [...used], unique, message: `Position ${i} has digit ${d}. Each smaller choice x here, with the prefix already fixed, opens completions counted in one multiplication.` })
    if (used.includes(d)) {
      allNew = false
      frames.push({ phase: 'digit', activeLine: L('if (used.includes(d))'), pythonLine: P('if d in used'), index: i, used: [...used], unique, message: `Digit ${d} repeats the prefix, so no longer number can have all digits distinct.` })
      break
    }
    used.push(d)
  }
  if (allNew) unique += 1
  const result = n - unique
  frames.push({ phase: 'done', activeLine: L('return n - unique'), pythonLine: P('return n - unique'), index: len, used: [...used], unique, message: `${n} minus ${unique} distinct numbers gives ${result}.` })
  return { input: n, result, frames }
}
