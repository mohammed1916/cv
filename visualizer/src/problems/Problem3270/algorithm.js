export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with num1, num2 and num3.')
  const { num1, num2, num3 } = input
  for (const value of [num1, num2, num3]) {
    if (!Number.isInteger(value) || value < 1 || value > 9999) throw new Error('Each number is an integer from 1 to 9999.')
  }
  return { num1, num2, num3 }
}

export function buildTrace({ num1, num2, num3 }) {
  const padded = [num1, num2, num3].map(n => String(n).padStart(4, '0'))
  const frames = []
  frames.push({ pythonLine: PY('padded = '), phase: 'start', activeLine: L('const padded'), position: -1, digits: padded, key: '', message: `Pad the numbers to four digits: ${padded.join(', ')}.` })
  let key = ''
  for (let p = 0; p < 4; p++) {
    const column = padded.map(s => Number(s[p]))
    const low = Math.min(...column)
    key += String(low)
    frames.push({ pythonLine: PY('low = min'), phase: 'digit', activeLine: L('const low'), position: p, digits: padded, key, message: `Position ${p}: digits ${column.join(', ')}, smallest is ${low}.` })
  }
  const result = Number(key)
  frames.push({ pythonLine: PY('return int'), phase: 'done', activeLine: L('return Number(key)'), position: -1, digits: padded, key, result, message: `The key is ${result}.` })
  return { input: { num1, num2, num3 }, result, frames }
}

export const code = `function findTheKey(num1, num2, num3) {
  const padded = [num1, num2, num3].map(n => String(n).padStart(4, '0'))
  let key = ''
  for (let p = 0; p < 4; p++) {
    const low = Math.min(...padded.map(s => Number(s[p])))
    key += String(low)
  }
  return Number(key)
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def find_the_key(num1, num2, num3):
    padded = [str(n).zfill(4) for n in (num1, num2, num3)]
    key = ""
    for p in range(4):
        low = min(int(s[p]) for s in padded)
        key += str(low)
    return int(key)
`
const PY = s => python.split('\n').findIndex(line => line.includes(s)) + 1
