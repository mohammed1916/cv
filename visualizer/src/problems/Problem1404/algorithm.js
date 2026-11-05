export const phases = [
  { id: 'start', label: 'Start', description: 'Read the binary digits. The leading 1 is never divided, so the scan starts at the least significant bit.' },
  { id: 'odd', label: 'Odd: add then halve', description: 'When the effective bit is 1, one add-one step and one halve step are needed.' },
  { id: 'even', label: 'Even: halve', description: 'When the effective bit is 0 or 2, a single halve step clears it.' },
  { id: 'carry', label: 'Leading carry', description: 'A carry left over at the top needs one more add-one step.' },
  { id: 'done', label: 'Complete', description: 'Return the total number of steps.' },
]

export function parseInput(text) {
  const bits = JSON.parse(text)
  if (typeof bits !== 'string' || !/^1[01]*$/.test(bits) || bits.length > 40) {
    throw new Error('Enter a JSON string of binary digits that starts with 1, up to 40 digits, such as "1011".')
  }
  return bits
}

export function buildTrace(bits) {
  const n = bits.length
  let steps = 0
  let carry = 0
  const snap = (index, value, extra = {}) => ({ bits, index, value, carry, steps, ...extra })
  const frames = [{
    phase: 'start', activeLine: L('let steps = 0'), pythonLine: PY('steps = 0'), snapshot: snap(null, null),
    message: `Binary ${bits}. Scan from the last digit toward the second digit, tracking a carry from any add-one step.`,
  }]
  for (let i = n - 1; i >= 1; i--) {
    const value = Number(bits[i]) + carry
    if (value === 1) {
      steps += 2
      carry = 1
      frames.push({
        phase: 'odd', activeLine: L('value === 1'), pythonLine: PY('if value == 1'), snapshot: snap(i, value),
        message: `Digit ${i} with carry gives effective bit 1, which is odd. Add one (carry 1), then halve. Steps so far: ${steps}.`,
      })
    } else {
      steps += 1
      carry = value / 2
      frames.push({
        phase: 'even', activeLine: L('} else {'), pythonLine: PY('else:'), snapshot: snap(i, value),
        message: value === 0
          ? `Digit ${i} is 0 with no carry, so the number is even. Halve once. Steps so far: ${steps}.`
          : `Digit ${i} is 1 with carry 1, so the effective bit is 0 and the number is even. Halve once. Steps so far: ${steps}.`,
      })
    }
  }
  if (carry === 1) {
    steps += 1
    frames.push({
      phase: 'carry', activeLine: L('carry === 1'), pythonLine: PY('if carry:'), snapshot: snap(null, null),
      message: `The leading 1 still carries, which needs one more add-one step. Steps: ${steps}.`,
    })
  }
  frames.push({
    phase: 'done', activeLine: L('return steps'), pythonLine: PY('return steps'), snapshot: snap(null, null),
    message: `Total steps to reach 1: ${steps}.`,
  })
  return { input: bits, result: steps, frames }
}

export const code = `function numSteps(s) {
  let steps = 0
  let carry = 0
  for (let i = s.length - 1; i >= 1; i--) {
    const value = Number(s[i]) + carry
    if (value === 1) {
      steps += 2
      carry = 1
    } else {
      steps += 1
      carry = value / 2
    }
  }
  if (carry === 1) steps += 1
  return steps
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def num_steps(s):
    steps = 0
    carry = 0
    for i in range(len(s) - 1, 0, -1):
        value = int(s[i]) + carry
        if value == 1:
            steps += 2
            carry = 1
        else:
            steps += 1
            carry = value // 2
    if carry:
        steps += 1
    return steps
`
const PY = s => python.split('\n').findIndex(l => l.includes(s)) + 1
