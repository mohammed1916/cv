const MOD = 1000000007

export function parseInput(text) {
  const input = JSON.parse(text)
  const nums = input?.nums
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Use {"nums": [...]} with 1 to 12 strengths.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 1000)) throw new Error('Strengths are integers from 1 to 1000 (the visualization caps values).')
  return { nums }
}

export function buildTrace(input) {
  const sorted = [...input.nums].sort((a, b) => a - b)
  const frames = [{ phase: 'sort', activeLine: L('sort a copy of the strengths'), at: -1, x: null, total: 0, carry: 0, sorted, message: `Sorted strengths: ${sorted.join(', ')}.` }]
  let total = 0
  let carry = 0
  sorted.forEach((x, i) => {
    total = (total + ((x * x) % MOD) * ((x + carry) % MOD)) % MOD
    frames.push({ phase: 'add', activeLine: L('add x squared'), at: i, x, total, carry, sorted, message: `${x} as the strongest hero adds ${x}^2 times (${x} + ${carry}) to the total. Total: ${total}.` })
    carry = (2 * carry + x) % MOD
    frames.push({ phase: 'carry', activeLine: L('set carry to twice'), at: i, x, total, carry, sorted, message: `Carry grows to ${carry}: every earlier hero can now also join ${x}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return total'), at: -1, x: null, total, carry, sorted, message: `Sum of powers modulo 1000000007: ${total}.` })
  return { input, sorted, result: total, frames }
}

export const code = `sum the power of every non-empty group of heroes, modulo 1000000007
  sort a copy of the strengths in ascending order
  set total to zero and carry to zero
  for each strength x in that order
    add x squared times (x plus carry) to total, modulo 1000000007
    set carry to twice carry plus x, modulo 1000000007
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def power_of_heroes(nums):
    MOD = 10 ** 9 + 7
    ordered = sorted(nums)
    total = 0
    carry = 0
    for x in ordered:
        total = (total + (x * x % MOD) * ((x + carry) % MOD)) % MOD
        carry = (2 * carry + x) % MOD
    return total
`
