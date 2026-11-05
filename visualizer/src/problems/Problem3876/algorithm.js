const codeLines = `function constructUniform(nums1) {
  const odds = nums1.filter(v => v % 2 === 1)
  const evens = nums1.filter(v => v % 2 === 0)
  if (odds.length === 0 || evens.length === 0) return true
  const lo = Math.min(...odds)
  const ev = Math.min(...evens)
  if (lo < ev) {
    const out = []
    for (const v of nums1) out.push(v % 2 === 0 ? v - lo : v)
    return true
  }
  return false
}`.split('\n').map((text, index) => ({ line: index + 1, text: text.trim() }))
const L = s => codeLines.findIndex(c => c.text.includes(s)) + 1
const pythonLines = `def construct_uniform(nums1):
    odds = [v for v in nums1 if v % 2 == 1]
    evens = [v for v in nums1 if v % 2 == 0]
    if not odds or not evens:
        return True
    lo, ev = min(odds), min(evens)
    if lo < ev:
        return True
    return False`.split('\n')
const P = s => pythonLines.findIndex(t => t.includes(s)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.nums1)) throw new Error('Use an object with nums1, a list of distinct integers.')
  const nums = input.nums1
  if (nums.length < 1 || nums.length > 12) throw new Error('nums1 has 1 to 12 values in this visual.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('Values are integers from 1 to 100.')
  if (new Set(nums).size !== nums.length) throw new Error('Values must be distinct.')
  return { nums1: nums }
}

export function buildTrace({ nums1 }) {
  const odds = nums1.filter(v => v % 2 === 1)
  const evens = nums1.filter(v => v % 2 === 0)
  const frames = [{ phase: 'split', activeLine: L('const odds'), pythonLine: P('odds = '), index: -1, out: [],
    message: `${odds.length} odd and ${evens.length} even value${evens.length === 1 ? '' : 's'}.` }]
  if (!odds.length || !evens.length) {
    frames.push({ phase: 'done', activeLine: L('if (odds.length === 0'), pythonLine: P('return True'), index: -1, out: nums1, result: true,
      message: 'One parity group is empty, so every value keeps its parity.' })
    return { input: { nums1 }, result: true, frames }
  }
  const lo = Math.min(...odds)
  const ev = Math.min(...evens)
  frames.push({ phase: 'compare', activeLine: L('const lo ='), pythonLine: P('lo, ev ='), index: nums1.indexOf(lo), out: [],
    message: `Smallest odd is ${lo}; smallest even is ${ev}.` })
  const result = lo < ev
  const out = []
  if (result) {
    nums1.forEach((v, i) => {
      const value = v % 2 === 0 ? v - lo : v
      out.push(value)
      frames.push({ phase: 'assign', activeLine: L('out.push(v % 2'), pythonLine: P('return True'), index: i, out: [...out],
        message: v % 2 === 0 ? `${v} - ${lo} = ${value}, which is odd.` : `${v} stays odd.` })
    })
  }
  frames.push({ phase: 'done', activeLine: L(result ? 'return true' : 'return false'), pythonLine: P(result ? 'return True' : 'return False'),
    index: -1, out, result,
    message: result ? `Every even value is larger than ${lo}, so the odd target works.` : `Some even value ${ev} is not above the smallest odd ${lo}.` })
  return { input: { nums1 }, result, frames }
}

export const code = codeLines
export const python = pythonLines.join('\n')
