const TOP = 10

const CODE = [
  'function minimizeXor(num1, num2) {',
  '  let need = popcount(num2)',
  '  let result = 0',
  '  for (let bit = 10; bit >= 0; bit--) {',
  '    if (need > 0 && ((num1 >> bit) & 1)) {',
  '      result |= 1 << bit',
  '      need--',
  '    }',
  '  }',
  '  for (let bit = 0; bit <= 10; bit++) {',
  '    if (need > 0 && !((result >> bit) & 1)) {',
  '      result |= 1 << bit',
  '      need--',
  '    }',
  '  }',
  '  return result',
  '}',
]

const PY = [
  'def minimize_xor(num1, num2):',
  "    need = bin(num2).count('1')",
  '    result = 0',
  '    for bit in range(10, -1, -1):',
  '        if need > 0 and (num1 >> bit) & 1:',
  '            result |= 1 << bit',
  '            need -= 1',
  '    for bit in range(0, 11):',
  '        if need > 0 and not (result >> bit) & 1:',
  '            result |= 1 << bit',
  '            need -= 1',
  '    return result',
]

const at = (lines, text) => {
  const index = lines.findIndex(line => line.includes(text.trim()))
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}
const codeLine = text => at(CODE, text)
const pyLine = (text, occurrence = 1) => {
  let seen = 0
  const index = PY.findIndex(line => line.includes(text) && ++seen === occurrence)
  if (index < 0) throw new Error(`Missing Python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Start', description: 'Count the set bits that x must have.' },
  { id: 'match', label: 'Match num1', description: 'Set high bits of x that num1 also has, while the budget lasts.' },
  { id: 'fill', label: 'Fill lowest', description: 'Spend the remaining budget on the lowest free bits.' },
  { id: 'done', label: 'Complete', description: 'Report x.' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with num1 and num2.')
  const { num1, num2 } = data
  if (!Number.isInteger(num1) || num1 < 1 || num1 > 1023) throw new Error('num1 must be an integer from 1 to 1023.')
  if (!Number.isInteger(num2) || num2 < 1 || num2 > 1023) throw new Error('num2 must be an integer from 1 to 1023.')
  return { num1, num2 }
}

const popcount = v => { let c = 0; for (let x = v; x > 0; x &= x - 1) c++; return c }

export function buildTrace({ num1, num2 }) {
  const frames = []
  // roles[bit] is 'match', 'fill' or '' once that bit has been decided.
  const roles = Array(TOP + 1).fill('')
  let need = popcount(num2)
  let result = 0
  frames.push({ phase: 'start', pythonLine: pyLine("need = bin(num2)"), activeLine: codeLine('let need = popcount(num2)'), bit: -1, need, result, roles: [...roles], message: `num2 has ${need} set bits, so x needs ${need}.` })
  for (let bit = TOP; bit >= 0; bit--) {
    if (need > 0 && (num1 >> bit) & 1) {
      result |= 1 << bit
      need--
      roles[bit] = 'match'
      frames.push({ phase: 'match', pythonLine: pyLine('result |= 1 << bit'), activeLine: codeLine('result |= 1 << bit'), bit, need, result, roles: [...roles], message: `num1 has bit ${bit}; set it in x. ${need} bits still needed.` })
    }
  }
  for (let bit = 0; bit <= TOP; bit++) {
    if (need > 0 && !((result >> bit) & 1)) {
      result |= 1 << bit
      need--
      roles[bit] = 'fill'
      frames.push({ phase: 'fill', pythonLine: pyLine('result |= 1 << bit', 2), activeLine: codeLine('if (need > 0 && !((result'), bit, need, result, roles: [...roles], message: `Use the lowest free bit ${bit} for x. ${need} bits still needed.` })
    }
  }
  frames.push({ phase: 'done', pythonLine: pyLine('return result'), activeLine: codeLine('return result'), bit: -1, need, result, roles: [...roles], message: `x = ${result}, and x XOR ${num1} = ${result ^ num1}.` })
  return { input: { num1, num2 }, result, frames }
}

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n') + '\n'
