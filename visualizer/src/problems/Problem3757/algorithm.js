export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 8 || !nums.every(x => Number.isInteger(x) && x >= 1 && x <= 15)) {
    throw new Error('nums has 1 to 8 integers from 1 to 15.')
  }
  return { nums }
}

const bits = m => m.toString(2)

function bitCount(m) {
  let count = 0
  for (let v = m; v > 0; v &= v - 1) count++
  return count
}

export function buildTrace({ nums }) {
  const frames = []
  let total = 0
  for (const x of nums) total |= x
  const n = nums.length
  frames.push({ phase: 'start', pythonLine: P('for x in nums'), activeLine: L('total |= x'), total, sub: total, inside: null, sign: null, eq: null, answer: null, message: `The strength is ${total} (binary ${bits(total)}).` })
  let eq = 0n
  let sub = total
  while (true) {
    const inside = nums.filter(x => (x & ~sub) === 0).length
    const sign = bitCount(total ^ sub) % 2 === 0 ? 1n : -1n
    eq += sign * (1n << BigInt(inside))
    frames.push({ phase: 'subset', pythonLine: P('inside = sum'), activeLine: L('const inside'), total, sub, inside, sign: Number(sign), eq: Number(eq), answer: null, message: `Keep bits ${bits(sub)}: ${inside} number${inside === 1 ? '' : 's'} fit, term ${sign > 0n ? '+' : '-'}2^${inside}.` })
    if (sub === 0) break
    sub = (sub - 1) & total
  }
  const pow = 1n << BigInt(n)
  const answer = Number(((pow - eq) % 1000000007n + 1000000007n) % 1000000007n)
  frames.push({ phase: 'done', pythonLine: P('return (2'), activeLine: L('return Number'), total, sub: null, inside: null, sign: null, eq: Number(eq), answer, message: `Subsets that leave a smaller strength: ${answer}.` })
  return { input: { nums }, result: answer, total, frames }
}

export const code = `function countEffective(nums) {
  let total = 0
  for (const x of nums) total |= x
  let eq = 0n
  let sub = total
  for (;;) {
    const inside = nums.filter(x => (x & ~sub) === 0).length
    const sign = bitCount(total ^ sub) % 2 === 0 ? 1n : -1n
    eq += sign * (1n << BigInt(inside))
    if (sub === 0) break
    sub = (sub - 1) & total
  }
  const pow = 1n << BigInt(nums.length)
  return Number(((pow - eq) % 1000000007n + 1000000007n) % 1000000007n)
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const hit = code.find(c => c.text.includes(s))
  if (!hit) throw new Error(`No JavaScript line contains "${s}".`)
  return hit.line
}
const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`No Python line contains "${s}".`)
  return index + 1
}

export const python = `def count_effective(nums):
    total = 0
    for x in nums:
        total |= x
    eq = 0
    sub = total
    while True:
        inside = sum(1 for x in nums if (x & ~sub) == 0)
        sign = -1 if bin(total ^ sub).count('1') % 2 else 1
        eq += sign * 2 ** inside
        if sub == 0:
            break
        sub = (sub - 1) & total
    return (2 ** len(nums) - eq) % (10**9 + 7)
`
