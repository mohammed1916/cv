const TOP = 10

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
  let need = popcount(num2)
  let result = 0
  frames.push({ phase: 'start', activeLine: L('set result to 0'), bit: -1, need, result, message: `num2 has ${need} set bits, so x needs ${need}.` })
  for (let bit = TOP; bit >= 0; bit--) {
    if (need > 0 && (num1 >> bit) & 1) {
      result |= 1 << bit
      need--
      frames.push({ phase: 'match', activeLine: L('set this bit in result'), bit, need, result, message: `num1 has bit ${bit}; set it in x. ${need} bits still needed.` })
    }
  }
  for (let bit = 0; bit <= TOP; bit++) {
    if (need > 0 && !((result >> bit) & 1)) {
      result |= 1 << bit
      need--
      frames.push({ phase: 'fill', activeLine: L('fill the lowest'), bit, need, result, message: `Use the lowest free bit ${bit} for x. ${need} bits still needed.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return result'), bit: -1, need, result, message: `x = ${result}, and x XOR ${num1} = ${result ^ num1}.` })
  return { input: { num1, num2 }, result, frames }
}

export const code = `minimum XOR with the set bit count of num2
  set result to 0
  set need to the number of set bits in num2
  for each bit from the top down to 0 do
    if need is above 0 and num1 has this bit set then
      set this bit in result and decrease need by one
  for each bit from 0 up to the top do
    if need is above 0 and result does not have this bit then
      fill the lowest free bit and decrease need by one
  return result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error('missing code line: ' + s); return i + 1 }

export const python = `def minimize_xor(num1, num2):
    need = bin(num2).count('1')
    result = 0
    for bit in range(10, -1, -1):
        if need > 0 and (num1 >> bit) & 1:
            result |= 1 << bit
            need -= 1
    for bit in range(0, 11):
        if need > 0 and not (result >> bit) & 1:
            result |= 1 << bit
            need -= 1
    return result
`
