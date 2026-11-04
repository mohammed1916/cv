export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with s and target.')
  const { s, target } = data
  if (typeof s !== 'string' || typeof target !== 'string') throw new Error('s and target must be binary strings.')
  if (s.length < 1 || s.length > 12 || s.length !== target.length) throw new Error('s and target must have the same length, from 1 to 12.')
  if (!/^[01]+$/.test(s) || !/^[01]+$/.test(target)) throw new Error('Use only the characters 0 and 1.')
  return { s, target }
}

export function buildTrace({ s, target }) {
  const frames = []
  frames.push({ phase: 'start', activeLine: L('if (s === target)'), pythonLine: 2, s, target, message: `Compare s = ${s} with target = ${target}.` })
  if (s === target) {
    frames.push({ phase: 'equal', activeLine: L('if (s === target)'), pythonLine: 3, s, target, message: 'The strings already match, so no operation is needed.' })
    return { input: { s, target }, result: true, frames }
  }
  const sOnes = s.includes('1')
  const tOnes = target.includes('1')
  frames.push({ phase: 'ones', activeLine: L('if (!s.includes("1")'), pythonLine: 4, s, target, message: `s ${sOnes ? 'has' : 'has no'} a 1; target ${tOnes ? 'has' : 'has no'} a 1.` })
  const result = sOnes && tOnes
  frames.push({ phase: 'done', activeLine: L(result ? 'return true // both' : 'if (!s.includes("1")'), pythonLine: 4, s, target, message: result ? 'Both strings contain a 1, so the strings can be made equal.' : 'One side has no 1 and the strings differ, so they cannot be made equal.' })
  return { input: { s, target }, result, frames }
}

const CODE = [
  'function makeStringsEqual(s, target) {',
  '  if (s === target) return true',
  '  if (!s.includes("1") || !target.includes("1")) return false',
  '  return true // both strings contain a 1, so they can be made equal',
  '}',
]
export const code = CODE.map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = CODE.findIndex(c => c.includes(s)); if (i < 0) throw new Error('missing code line: ' + s); return i + 1 }

export const python = `def make_strings_equal(s, target):
    if s == target:
        return True
    return '1' in s and '1' in target
`
