export function parseInput(text) {
  const data = JSON.parse(text), n = data?.n, x = data?.x
  if (!Number.isInteger(n) || n < 0 || n > 100000 || !Number.isInteger(x) || x < 0 || x > 9) throw new Error('Enter {"n":101,"x":0}: integer n from 0 to 100,000 and digit x from 0 to 9.')
  return { n, x }
}
export function buildTrace({ n, x }) {
  const input = String(n), target = String(x)
  let found = false
  const frames = [{ phase: 'start', index: -1, found, leading: null, activeLine: 2, message: `Write ${n} in decimal. Target digit: ${x}. Zero is represented by the single digit 0.` }]
  for (let i = 0; i < input.length; i++) {
    found ||= input[i] === target
    frames.push({ phase: 'scan', index: i, found, leading: null, activeLine: 5, message: `Digit [${i}] is ${input[i]}: ${input[i] === target ? 'match' : 'not a match'}. Seen target so far: ${found}.` })
  }
  const leading = input[0] !== target, result = found && leading
  frames.push({ phase: 'leading', index: 0, found, leading, activeLine: 6, message: `Leading digit ${input[0]} ${leading ? 'differs from' : 'equals'} target ${x}: leading-digit rule ${leading ? 'passes' : 'fails'}.` })
  frames.push({ phase: 'done', index: -1, found, leading, activeLine: 7, message: `Contains target (${found}) AND starts with a different digit (${leading}) = ${result}.` })
  return { input, target, result, frames }
}
export const code = `def validNumber(n, x):
    digits, target = str(n), str(x)
    found = False
    for digit in digits:
        found = found or digit == target
    different_first = digits[0] != target
    return found and different_first`.split('\n').map((text, index) => ({ line: index + 1, text }))
