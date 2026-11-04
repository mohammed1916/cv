export const phases = [
  { id: 'start', label: 'Start', description: 'Nothing is read yet: the best length is 0 and no subarray is open.' },
  { id: 'element', label: 'Read element', description: 'Take the next number. Its sign decides how the two running lengths change.' },
  { id: 'zero', label: 'Zero resets', description: 'A zero makes every product through it zero, so both running lengths restart.' },
  { id: 'extend', label: 'Extend or flip', description: 'A positive number extends both lengths. A negative number swaps them, because it flips the sign.' },
  { id: 'done', label: 'Complete', description: 'The best positive-product length seen at any position is the answer.' },
]

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 16 || !nums.every(v => Number.isInteger(v) && Math.abs(v) <= 9)) {
    throw new Error('Enter a JSON array of 1 to 16 integers from -9 to 9.')
  }
  return nums
}

export const code = [
  "function longestPositive(nums) {",
  "  let best = 0, pos = 0, neg = 0",
  "  for (let i = 0; i < nums.length; i++) {",
  "    const x = nums[i]",
  "    if (x === 0) { pos = 0; neg = 0 }",
  "    else if (x > 0) { pos = pos + 1; neg = neg > 0 ? neg + 1 : 0 }",
  "    else { [pos, neg] = [neg > 0 ? neg + 1 : 0, pos + 1] }",
  "    best = Math.max(best, pos) }",
  "  return best }",
].map((text, index) => ({ line: index + 1, text }))

export const python = `def longest_positive(nums):
    best = 0
    pos = 0
    neg = 0
    for index, x in enumerate(nums):
        if x == 0:
            pos, neg = 0, 0
        elif x > 0:
            pos, neg = pos + 1, (neg + 1 if neg > 0 else 0)
        else:
            pos, neg = (neg + 1 if neg > 0 else 0), pos + 1
        best = max(best, pos)
    return best`

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace(nums) {
  let best = 0
  let pos = 0
  let neg = 0
  const snap = (index, x) => ({ index, x, pos, neg, best })
  const frames = [{ phase: 'start', activeLine: L('best = 0'), pythonLine: P('best = 0'), snapshot: snap(null, null), message: 'Nothing is read yet. pos is the longest subarray ending here with a positive product, and neg the longest with a negative product. Both start at 0.' }]
  nums.forEach((x, index) => {
    frames.push({ phase: 'element', activeLine: L('for (let i = 0'), pythonLine: P('for index, x'), snapshot: snap(index, x), message: `Read ${x} at index ${index}.` })
    const prevPos = pos
    const prevNeg = neg
    if (x === 0) {
      pos = 0
      neg = 0
      frames.push({ phase: 'zero', activeLine: L('if (x === 0)'), pythonLine: P('if x == 0'), snapshot: snap(index, x), message: `${x} is zero, so every subarray through it has product 0. Both lengths reset.` })
    } else if (x > 0) {
      pos = prevPos + 1
      neg = prevNeg > 0 ? prevNeg + 1 : 0
      frames.push({ phase: 'extend', activeLine: L('pos = pos + 1'), pythonLine: P('elif x > 0'), snapshot: snap(index, x), message: `${x} is positive, so the signs are kept. pos grows to ${pos}${neg ? `, and neg grows to ${neg}` : ', and no negative run ends here'}.` })
    } else {
      pos = prevNeg > 0 ? prevNeg + 1 : 0
      neg = prevPos + 1
      frames.push({ phase: 'extend', activeLine: L('else {'), pythonLine: P('else:'), snapshot: snap(index, x), message: `${x} is negative, so the signs flip. The old negative run (${prevNeg}) becomes positive: pos = ${pos}. neg = ${neg}, starting from the old positive run.` })
    }
    const before = best
    best = Math.max(best, pos)
    frames.push({ phase: 'extend', activeLine: L('best = Math.max'), pythonLine: P('best = max'), snapshot: snap(index, x), message: `Keep the larger of ${before} and pos = ${pos}: best is ${best}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return best'), pythonLine: P('return best'), snapshot: snap(null, null), message: `Return ${best}, the longest subarray with a positive product.` })
  return { input: nums, result: best, frames }
}
