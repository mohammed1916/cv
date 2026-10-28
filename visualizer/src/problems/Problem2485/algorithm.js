export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object with n.')
  const { n } = input
  if (!Number.isInteger(n) || n < 1 || n > 1000) throw new Error('n must be an integer from 1 to 1000.')
  return { n }
}

export function buildTrace({ n }) {
  const total = n * (n + 1) / 2
  let left = 0
  const frames = [{ phase: 'start', activeLine: L('set total to'), x: 0, left: 0, right: total, message: `The sum of 1 to ${n} is ${total}.` }]
  let answer = -1
  for (let x = 1; x <= n; x++) {
    left += x
    const right = total - left + x
    const match = left === right
    frames.push({ phase: 'check', activeLine: L('if left equals right'), x, left, right, message: `Sum 1 to ${x} is ${left}; sum ${x} to ${n} is ${right}${match ? ', so x is the pivot.' : '.'}` })
    if (match) {
      answer = x
      break
    }
  }
  frames.push({ phase: 'done', activeLine: L(answer === -1 ? 'return -1' : 'then return x'), x: answer, left, right: total - left, message: answer === -1 ? 'No pivot exists.' : `The pivot integer is ${answer}.` })
  return { input: { n }, result: answer, frames }
}

export const code = `find the integer x where the sum from 1 to x equals the sum from x to n
read n from the input
set total to the sum of 1 to n
set left to 0
for each x from 1 to n do
  add x to left, so left is the sum from 1 to x
  set right to total minus left plus x, which is the sum from x to n
  if left equals right then return x
return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def pivot_integer(n):
    total = n * (n + 1) // 2
    left = 0
    for x in range(1, n + 1):
        left += x
        right = total - left + x
        if left == right:
            return x
    return -1
`
