export function parseInput(text) {
  const num = JSON.parse(text)
  if (!Number.isInteger(num) || num < 0 || num > 100000000) throw new Error('Enter an integer from 0 to 100,000,000.')
  return num
}

// Swap the largest digit found after position i with digit i, using the last occurrence of each digit.
export function buildTrace(num) {
  const digits = String(num).split('').map(Number)
  const last = Array(10).fill(-1)
  digits.forEach((d, i) => { last[d] = i })
  const frames = [{ phase: 'start', digits: [...digits], swap: null, activeLine: 2, message: `Digits of ${num}; record the last position of each digit.` }]
  let done = false
  for (let i = 0; i < digits.length && !done; i++) {
    for (let d = 9; d > digits[i]; d--) {
      if (last[d] > i) {
        const j = last[d]
        ;[digits[i], digits[j]] = [digits[j], digits[i]]
        frames.push({ phase: 'swap', digits: [...digits], swap: [i, j], activeLine: 7, message: `Swap position ${i} (${num.toString()[i]}) with the larger digit ${d} at ${j}.` })
        done = true
        break
      }
    }
    if (!done) frames.push({ phase: 'scan', digits: [...digits], swap: null, index: i, activeLine: 5, message: `Position ${i} (${digits[i]}) has no larger digit later.` })
  }
  const result = Number(digits.join(''))
  frames.push({ phase: 'done', digits: [...digits], swap: null, result, activeLine: 9, message: `Maximum after at most one swap: ${result}.` })
  return { input: num, result, frames }
}

export const code = `record the last position of each digit in num
for each digit position i from left to right:
  look for a greater digit to the right, trying 9 downward
  if one exists, swap position i with its rightmost occurrence, then stop
return the resulting number`.split('\n').map((text, index) => ({ line: index + 1, text }))

// Scan trace: activeLine 1 (setup), 3 (no greater digit at this position), 4 (swap), 5 (return).
export const LINE_MAP = { 1: 1, 3: 3, 4: 4, 5: 5 }

export const familyLine = frame => LINE_MAP[frame.activeLine] ?? frame.activeLine

export const python = `def maximum_swap(num):
    digits = list(str(num))
    last = {digit: index for index, digit in enumerate(digits)}
    for i, current in enumerate(digits):
        for d in range(9, int(current), -1):
            digit = str(d)
            if digit in last and last[digit] > i:
                j = last[digit]
                digits[i], digits[j] = digits[j], digits[i]
                return int(''.join(digits))
    return num`
