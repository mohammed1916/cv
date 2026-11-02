export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 20) throw new Error('Use a JSON array of 1 to 20 integers.')
  if (!nums.every(v => Number.isInteger(v) && Math.abs(v) <= 1000)) throw new Error('Each value is an integer between -1000 and 1000.')
  return { nums }
}

export function buildTrace({ nums }) {
  const frames = []
  let k = nums.length - 1
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('set k to the last index'), k, cmp: -1, message: `Start with the suffix [${k}..]. A single element is always increasing.` })
  while (true) {
    if (k === 0) {
      frames.push({ pythonLine: 3, phase: 'compare', activeLine: L('while k is above 0'), k, cmp: -1, message: 'k reached 0, so the whole array is strictly increasing.' })
      break
    }
    const ok = nums[k - 1] < nums[k]
    frames.push({ pythonLine: 3, phase: 'compare', activeLine: L('while k is above 0'), k, cmp: k - 1, message: `${nums[k - 1]} ${ok ? '<' : '>='} ${nums[k]}, so ${ok ? 'the suffix can grow left' : 'index ' + (k - 1) + ' must be removed'}.` })
    if (!ok) break
    k -= 1
    frames.push({ pythonLine: 4, phase: 'extend', activeLine: L('move k one step left'), k, cmp: -1, message: `Extend the suffix to start at ${k}.` })
  }
  frames.push({ pythonLine: 5, phase: 'done', activeLine: L('return k'), k, cmp: -1, message: `Remove the first ${k} element${k === 1 ? '' : 's'}.` })
  return { input: { nums }, result: k, frames }
}

export const code = `minimum prefix removal to make the rest strictly increasing
  set k to the last index
  while k is above 0 and the value at k minus 1 is less than the value at k
    move k one step left
  return k`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_prefix_removal(nums):
    k = len(nums) - 1
    while k > 0 and nums[k - 1] < nums[k]:
        k -= 1
    return k
`
