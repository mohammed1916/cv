export function parseInput(text) {
  const num = JSON.parse(text)
  if (!Number.isInteger(num) || num < 0 || num > 100000000) throw new Error('Enter a JSON integer from 0 to 100,000,000.')
  return num
}

// Remember where each digit last appears. Scan from the left: the first position that has a larger digit
// somewhere to its right is where the swap must happen, with the largest such digit's last occurrence.
export function buildTrace(num) {
  const digits = String(num).split('').map(Number)
  const last = Array(10).fill(-1)
  digits.forEach((d, i) => { last[d] = i })
  const frames = [{ phase: 'start', digits: [...digits], i: null, j: null, last: [...last], activeLine: L('const last = Array'), pythonLine: P('last = {'), message: `Record the last position of each digit in ${num}.` }]
  let result = num
  let done = false
  for (let i = 0; i < digits.length && !done; i++) {
    frames.push({ phase: 'scan', digits: [...digits], i, j: null, last: [...last], activeLine: L('for (let i = 0'), pythonLine: P('for i, ch in enumerate'), message: `Position ${i} holds ${digits[i]}. Look for a larger digit later in the number.` })
    for (let d = 9; d > digits[i]; d--) {
      if (last[d] > i) {
        const j = last[d]
        ;[digits[i], digits[j]] = [digits[j], digits[i]]
        result = Number(digits.join(''))
        frames.push({ phase: 'swap', digits: [...digits], i, j, last: [...last], activeLine: L('[digits[i], digits[j]]'), pythonLine: P('digits[i], digits[j] = digits[j], digits[i]'), message: `Swap the ${digits[j]} at ${i} with the ${digits[i]} at ${j}: the result is ${result}.` })
        done = true
        break
      }
    }
  }
  frames.push({ phase: 'done', digits: [...digits], i: null, j: null, last: [...last], result, activeLine: L('return num'), pythonLine: P('return num'), message: `Largest number after at most one swap: ${result}.` })
  return { input: num, result, frames }
}

const SOURCE = `function maximumSwap(num) {
  const digits = String(num).split('').map(Number)
  const last = Array(10).fill(-1)
  digits.forEach((d, i) => { last[d] = i })
  for (let i = 0; i < digits.length; i++) {
    for (let d = 9; d > digits[i]; d--) {
      if (last[d] > i) {
        const j = last[d]
        ;[digits[i], digits[j]] = [digits[j], digits[i]]
        return Number(digits.join(''))
      }
    }
  }
  return num
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximum_swap(num):
    digits = list(str(num))
    last = {ch: i for i, ch in enumerate(digits)}
    for i, ch in enumerate(digits):
        for d in range(9, int(ch), -1):
            j = last.get(str(d), -1)
            if j > i:
                digits[i], digits[j] = digits[j], digits[i]
                return int(''.join(digits))
    return num`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
