export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Number.isInteger(obj.num1) || !Number.isInteger(obj.num2)) throw new Error('Use an object with integer num1 and num2.')
  if (obj.num1 < 1 || obj.num2 > 100000 || obj.num1 > obj.num2) throw new Error('Use 1 <= num1 <= num2 <= 100000.')
  if (obj.num2 - obj.num1 > 300) throw new Error('The visualization accepts ranges of at most 301 numbers.')
  return { num1: obj.num1, num2: obj.num2 }
}

export function buildTrace(input) {
  const { num1, num2 } = input
  let total = 0
  const frames = [{ phase: 'start', activeLine: L('set total to 0'), number: num1, total: 0, message: `Add up the waviness of every number from ${num1} to ${num2}.` }]
  for (let x = num1; x <= num2; x++) {
    const d = String(x).split('').map(Number)
    let w = 0
    for (let i = 1; i < d.length - 1; i++) {
      if ((d[i] > d[i - 1] && d[i] > d[i + 1]) || (d[i] < d[i - 1] && d[i] < d[i + 1])) w += 1
    }
    total += w
    if (w > 0) frames.push({ phase: 'number', activeLine: L('if the digit at i is a peak'), number: x, total, message: `${x} has waviness ${w}. Running total: ${total}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), number: num2, total, message: `Total waviness: ${total}.` })
  return { input, result: total, frames }
}

export const code = `total waviness over the range:
  set total to 0
  for each number x from num1 to num2:
    set d to the digits of x
    for each inner position i from 2 to the second-last digit:
      if the digit at i is a peak or a valley then add 1 to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def total_waviness(num1, num2):
    total = 0
    for x in range(num1, num2 + 1):
        d = str(x)
        for i in range(1, len(d) - 1):
            if (d[i] > d[i - 1] and d[i] > d[i + 1]) or (d[i] < d[i - 1] and d[i] < d[i + 1]):
                total += 1
    return total
`
