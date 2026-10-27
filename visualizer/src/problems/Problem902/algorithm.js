export function parseInput(text) {
  const v = JSON.parse(text)
  if (!v || typeof v !== 'object' || !Array.isArray(v.digits)) throw new Error('Enter a JSON object like {"digits": ["1","3"], "n": 100}.')
  const { digits, n } = v
  if (!digits.length || digits.length > 9 || digits.some(d => typeof d !== 'string' || !/^[1-9]$/.test(d))) throw new Error('digits must hold 1-9 strings, each a single digit from "1" to "9".')
  for (let i = 1; i < digits.length; i++) if (digits[i] <= digits[i - 1]) throw new Error('digits must be unique and sorted in increasing order.')
  if (!Number.isInteger(n) || n < 1 || n > 1000000000) throw new Error('n must be an integer between 1 and 1,000,000,000.')
  return { digits: [...digits], n }
}
export function buildTrace({ digits, n }) {
  const s = String(n), k = s.length, m = digits.length
  const frames = [{ phase: 'start', activeLine: L('Let s be'), total: 0, pos: -1, message: `n = ${n} has ${k} digits. The digit set has ${m} digits, so any number with fewer digits is automatically at most n.` }]
  let total = 0
  for (let len = 1; len < k; len++) {
    total += m ** len
    frames.push({ phase: 'shorter', activeLine: L('add m to the power of length'), total, pos: -1, len, message: `Every ${len}-digit string over the set is below n: ${m}^${len} = ${m ** len} of them. Running total ${total}.` })
  }
  let result = null
  let doneLine = L('return total + 1')
  for (let i = 0; i < k; i++) {
    const smaller = digits.filter(d => d < s[i]).length
    const add = smaller * m ** (k - i - 1)
    total += add
    frames.push({ phase: 'position', activeLine: L('count the set digits smaller'), total, pos: i, smaller, message: `Position ${i} (digit ${s[i]}): ${smaller} set digits are smaller; each frees the remaining ${k - i - 1} positions: ${smaller} * ${m}^${k - i - 1} = ${add}. Total ${total}.` })
    if (!digits.includes(s[i])) {
      frames.push({ phase: 'stop', activeLine: L('return total'), total, pos: i, message: `${s[i]} is not in the set, so we cannot keep matching n's prefix. Stop with ${total}.` })
      result = total
      doneLine = L('return total')
      break
    }
    frames.push({ phase: 'match', activeLine: L('if s[i] is not in the digit set'), total, pos: i, message: `${s[i]} is in the set: keep it and continue to the next position.` })
  }
  if (result === null) {
    total += 1
    result = total
    frames.push({ phase: 'full', activeLine: L('return total + 1'), total, pos: k - 1, message: `All digits of n matched the set, so n itself is a valid number: add 1. Total ${total}.` })
  }
  frames.push({ phase: 'done', activeLine: doneLine, total: result, pos: -1, message: `${result} numbers are at most ${n}.` })
  return { input: { digits, n }, result, frames }
}
export const code = `Let s be the digits of n and k the number of digits in s
Set total to 0
for each length from 1 to k - 1
  add m to the power of length to total
for each position i from 0 to k - 1
  count the set digits smaller than s[i] as smaller
  add smaller times m to the power of (k - i - 1) to total
  if s[i] is not in the digit set
    return total
return total + 1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def numbers_at_most_n(digits, n):
    s = str(n)
    k = len(s)
    m = len(digits)
    total = 0
    for length in range(1, k):
        total += m ** length
    for i in range(k):
        smaller = sum(1 for d in digits if d < s[i])
        total += smaller * m ** (k - i - 1)
        if s[i] not in digits:
            return total
    return total + 1`
