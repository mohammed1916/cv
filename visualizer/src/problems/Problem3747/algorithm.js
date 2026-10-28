export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Number.isInteger(obj.n)) throw new Error('Use an object with an integer n.')
  if (obj.n < 1 || obj.n > 1000000000000000) throw new Error('n is an integer from 1 to 10^15.')
  return { n: obj.n }
}

export function buildTrace(input) {
  const { n } = input
  const digits = String(n).split('').map(Number)
  const L = digits.length
  let total = 0
  const frames = [{ phase: 'start', activeLine: L_('set total to 0'), index: -1, total: 0, message: `Count the zero-free numbers from 1 to ${n}.` }]
  for (let len = 1; len < L; len++) {
    total += 9 ** len
    frames.push({ phase: 'shorter', activeLine: L_('for each shorter length'), index: -1, total, message: `All zero-free numbers with ${len} digit(s): 9^${len} = ${9 ** len}.` })
  }
  let zeroFree = true
  for (let i = 0; i < L; i++) {
    const d = digits[i]
    if (d === 0) {
      zeroFree = false
      frames.push({ phase: 'digit', activeLine: L_('if the digit is 0'), index: i, total, message: `Digit ${i + 1} of n is 0, so no number with this prefix is zero-free. Stop.` })
      break
    }
    total += (d - 1) * 9 ** (L - i - 1)
    frames.push({ phase: 'digit', activeLine: L_('add (d - 1)'), index: i, total, message: `Digit ${d} allows ${d - 1} smaller nonzero digits, each followed by ${L - i - 1} free digits. Total: ${total}.` })
  }
  if (zeroFree) {
    total += 1
    frames.push({ phase: 'self', activeLine: L_('add 1 for n'), index: -1, total, message: `n has no zero digit, so n itself counts. Total: ${total}.` })
  }
  frames.push({ phase: 'done', activeLine: L_('return total'), index: -1, total, message: `Distinct integers after removing zeros: ${total}.` })
  return { input, result: total, frames }
}

export const code = `count distinct integers after removing zeros, up to n:
  set digits to the digits of n, length L
  set total to 0
  for each shorter length len from 1 to L - 1:
    add 9 to the power len
  set zero free to true
  for each position i from left to right:
    if the digit is 0 then
      set zero free to false and stop
    add (d - 1) times 9 to the power (L - i - 1)
  if zero free is still true then add 1 for n
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L_ = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_zero_free_up_to(n):
    digits = [int(ch) for ch in str(n)]
    L = len(digits)
    total = 0
    for length in range(1, L):
        total += 9 ** length
    zero_free = True
    for i, d in enumerate(digits):
        if d == 0:
            zero_free = False
            break
        total += (d - 1) * 9 ** (L - i - 1)
    if zero_free:
        total += 1
    return total
`
