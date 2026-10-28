export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Number.isInteger(input.n) || input.n < 1 || input.n > 100) throw new Error('Use {"n": value} with n an integer from 1 to 100.')
  return { n: input.n }
}

// Can the digit string be cut into contiguous pieces whose values add up to target?
function canSplit(digits, start, target) {
  if (start === digits.length) return target === 0
  let value = 0
  for (let end = start; end < digits.length; end++) {
    value = value * 10 + Number(digits[end])
    if (value > target) break
    if (canSplit(digits, end + 1, target - value)) return true
  }
  return false
}

export function buildTrace({ n }) {
  let total = 0
  const counted = []
  const frames = [{ phase: 'start', activeLine: L('set total to 0'), i: null, square: null, total, message: `Check every i from 1 to ${n}.` }]
  for (let i = 1; i <= n; i++) {
    const square = i * i
    const ok = canSplit(String(square), 0, i)
    frames.push({ phase: 'check', activeLine: L('if the digits of square'), i, square, total, message: `${i} squared is ${square}. ${ok ? 'Its pieces can add up to i, so it counts.' : 'No cut of its digits adds up to i.'}` })
    if (ok) {
      total += square
      counted.push(i)
      frames.push({ phase: 'add', activeLine: L('add square to total'), i, square, total, message: `Add ${square}; the total is now ${total}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return total'), i: null, square: null, total, message: `Punishment number: ${total}.` })
  return { input: { n }, counted, result: total, frames }
}

export const code = `punishment number up to n
  set total to 0
  for each i from 1 to n
    set square to i times i
    if the digits of square can be cut into pieces that sum to i then
      add square to total
  return total

can split(digits, start, target)
  if start is past the last digit then
    return whether target is 0
  build a number from the digits beginning at start, one digit at a time
    stop once that number passes target
    if the rest can split to target minus that number then
      return yes
  return no`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def punishment_number(n):
    def can_split(digits, start, target):
        if start == len(digits):
            return target == 0
        value = 0
        for end in range(start, len(digits)):
            value = value * 10 + int(digits[end])
            if value > target:
                break
            if can_split(digits, end + 1, target - value):
                return True
        return False

    total = 0
    for i in range(1, n + 1):
        square = str(i * i)
        if can_split(square, 0, i):
            total += i * i
    return total
`
