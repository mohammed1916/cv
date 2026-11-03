const codeLines = `choose the target parity for the new array
  if no odd value exists then every value keeps its own even parity
  otherwise take one odd value as the helper
  for each value in nums1
    if the target is even then keep the value
    else if the value is odd then keep the value
    else subtract the helper from the value
  return true`.split('\n').map((text, index) => ({ line: index + 1, text: text.trim() }))
const L = s => codeLines.findIndex(c => c.text.includes(s)) + 1
const pythonLines = `def construct_uniform(nums1):
    odd = next((v for v in nums1 if v % 2 == 1), None)
    target_even = odd is None
    out = []
    for v in nums1:
        if target_even or v % 2 == 1:
            out.append(v)
        else:
            out.append(v - odd)
    return True`.split('\n')
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
  const odd = nums1.find(v => v % 2 === 1)
  const targetEven = odd === undefined
  const out = []
  const frames = [{ phase: 'plan', activeLine: L('choose the target'), pythonLine: P('odd = next'), index: -1, out: [],
    message: targetEven ? 'No odd value exists, so every value stays even.' : `Use ${odd} as the odd helper.` }]
  nums1.forEach((v, i) => {
    let value = v
    if (!targetEven && v % 2 === 0) value = v - odd
    out.push(value)
    frames.push({ phase: 'assign', activeLine: L(targetEven ? 'keep the value' : 'subtract the helper'), pythonLine: P('out.append(v - odd)'),
      index: i, out: [...out], message: `${v} becomes ${value}, which is ${value % 2 === 0 ? 'even' : 'odd'}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return true'), pythonLine: P('return True'), index: -1, out: [...out], result: true,
    message: 'Every value now shares a parity, so the answer is true.' })
  return { input: { nums1 }, result: true, frames }
}

export const code = codeLines
export const python = pythonLines.join('\n')
