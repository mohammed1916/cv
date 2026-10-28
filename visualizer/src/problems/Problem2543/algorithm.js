export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('Use a JSON object with targetX and targetY.')
  for (const key of ['targetX', 'targetY']) {
    const v = obj[key]
    if (!Number.isInteger(v) || v < 1 || v > 1000) throw new Error(`${key} must be an integer from 1 to 1000 (visualization cap).`)
  }
  return { targetX: obj.targetX, targetY: obj.targetY }
}

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))

export function buildTrace(input) {
  const { targetX, targetY } = input
  const g = gcd(targetX, targetY)
  const result = (g & (g - 1)) === 0
  const frames = [
    { phase: 'start', activeLine: L('start the walk'), g: null, message: `Start at (1, 1). The target is (${targetX}, ${targetY}).` },
    { phase: 'gcd', activeLine: L('g = gcd'), g, message: `The gcd of ${targetX} and ${targetY} is ${g}.` },
    { phase: 'check', activeLine: L('if g is a power of two'), g, message: `${g} is ${result ? '' : 'not '}a power of two.` },
    { phase: 'done', activeLine: L(result ? 'return true' : 'return false'), g, message: `(${targetX}, ${targetY}) is ${result ? 'reachable' : 'not reachable'}.` },
  ]
  return { input, targetX, targetY, g, result, frames }
}

export const code = `reachable from (1, 1) to (targetX, targetY)
  start the walk at (1, 1)
  g = gcd of targetX and targetY
  the subtraction moves keep g, and a doubling move can at most double it
  if g is a power of two then
    return true
  return false`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from math import gcd

def is_reachable(targetX, targetY):
    g = gcd(targetX, targetY)
    return (g & (g - 1)) == 0
`
