export function parseInput(text) {
  const n = JSON.parse(text)
  if (!Number.isInteger(n) || n < 1 || n > 100000) throw new Error('Use an integer from 1 to 100000.')
  return n
}

// Ordered choices of b items from a distinct items.
const perm = (a, b) => {
  if (b < 0 || b > a) return 0
  let value = 1
  for (let i = 0; i < b; i++) value *= a - i
  return value
}

export function buildTrace(n) {
  const digits = String(n).split('').map(Number)
  const len = digits.length
  let unique = 0
  for (let k = 1; k < len; k++) unique += 9 * perm(9, k - 1)
  const frames = [{ phase: 'start', activeLine: L('count the positive'), index: -1, unique, message: `Numbers with fewer than ${len} digits: ${unique} have all digits distinct so far.` }]
  const used = []
  let allNew = true
  for (let i = 0; i < len; i++) {
    const d = digits[i]
    for (let x = i === 0 ? 1 : 0; x < d; x++) {
      if (!used.includes(x)) unique += perm(10 - used.length - 1, len - i - 1)
    }
    frames.push({ phase: 'digit', activeLine: L('for each digit d'), index: i, unique, message: `Position ${i} has digit ${d}. Smaller choices here add to the distinct count.` })
    if (used.includes(d)) {
      allNew = false
      frames.push({ phase: 'digit', activeLine: L('if d is already used'), index: i, unique, message: `Digit ${d} repeats, so no longer prefix can be all distinct.` })
      break
    }
    used.push(d)
  }
  if (allNew) unique += 1
  const result = n - unique
  frames.push({ phase: 'done', activeLine: L('return n minus'), index: len, unique, message: `${n} minus ${unique} distinct numbers gives ${result}.` })
  return { input: n, result, frames }
}

export const code = `count the positive integers up to n with all digits distinct, then subtract from n
count shorter numbers: 9 choices for the first digit, then ordered digits for the rest
walk the digits of n from the left, keeping the set of digits used in the prefix
for each digit d of n at position i do
  for each smaller unused digit x (not zero at the first position) do
    add the ways to fill the remaining positions with distinct digits
  if d is already used then stop
  mark d as used
if every digit of n was new then count n itself
return n minus the distinct count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from math import perm

def count_repeated_digits(n):
    digits = [int(ch) for ch in str(n)]
    length = len(digits)
    unique = sum(9 * perm(9, k - 1) for k in range(1, length))
    used = []
    all_new = True
    for i, d in enumerate(digits):
        for x in range(1 if i == 0 else 0, d):
            if x not in used:
                unique += perm(9 - len(used), length - i - 1)
        if d in used:
            all_new = False
            break
        used.append(d)
    if all_new:
        unique += 1
    return n - unique
`
