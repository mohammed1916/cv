export const phases = [
  { id: 'start', label: 'Setup', description: 'Create one counter per index.' },
  { id: 'outer', label: 'Index', description: 'Start counting for this index.' },
  { id: 'compare', label: 'Compare', description: 'Check a later index for opposite parity.' },
  { id: 'store', label: 'Store', description: 'Save this index count.' },
  { id: 'done', label: 'Result', description: 'Return the counts in index order.' },
]

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 20) throw new Error('Use a JSON array of 1 to 20 integers.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('Each value is an integer from 1 to 100.')
  return { nums }
}

export function buildTrace({ nums }) {
  const n = nums.length
  const answer = Array(n).fill(0)
  const frames = []
  const snap = () => answer.slice()
  frames.push({ phase: 'start', activeLine: L('let answer be an array'), pythonLine: P('answer = [0] * n'), message: `Start with ${n} zero counter${n === 1 ? '' : 's'}.`, i: -1, j: -1, count: 0, match: null, answer: snap() })
  for (let i = 0; i < n; i++) {
    let count = 0
    frames.push({ phase: 'outer', activeLine: L('for i from 0'), pythonLine: P('for i in range(n)'), message: `Index ${i} starts with a count of zero.`, i, j: -1, count, match: null, answer: snap() })
    for (let j = i + 1; j < n; j++) {
      const opposite = (nums[i] + nums[j]) % 2 === 1
      if (opposite) count++
      frames.push({ phase: 'compare', activeLine: L('have different parity'), pythonLine: P('if (nums[i] + nums[j])'), message: `${nums[i]} and ${nums[j]} ${opposite ? 'have opposite parity, so the count grows' : 'share parity, so the count stays'}.`, i, j, count, match: opposite, answer: snap() })
    }
    answer[i] = count
    frames.push({ phase: 'store', activeLine: L('store count at answer'), pythonLine: P('answer[i] = count'), message: `Index ${i} has ${count} later opposite-parity index${count === 1 ? '' : 'es'}.`, i, j: -1, count, match: null, answer: snap() })
  }
  frames.push({ phase: 'done', activeLine: L('return answer'), pythonLine: P('return answer'), message: 'Every index has its count, in original order.', i: -1, j: -1, count: 0, match: null, answer: snap() })
  return { input: { nums }, result: answer, frames }
}

export const code = `count later opposite-parity indices
  let n be the length of nums
  let answer be an array of n zeros
  for i from 0 to n minus 1
    set count to 0
    for j from i plus 1 to n minus 1
      if nums[i] and nums[j] have different parity then add one to count
    store count at answer[i]
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(line => line.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def count_opposite_parity(nums):
    n = len(nums)
    answer = [0] * n
    for i in range(n):
        count = 0
        for j in range(i + 1, n):
            if (nums[i] + nums[j]) % 2 == 1:
                count += 1
        answer[i] = count
    return answer`

const pyLines = python.split('\n')
const P = s => {
  const index = pyLines.findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}
