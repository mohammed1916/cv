// Original teaching model. The values are invented for this visualization.
// Valleys never touch each other, so each one is priced by its own neighbours and the two alternating patterns are compared.

export const phases = [
  { id: 'setup', label: 'Setup', description: 'Two patterns are possible: lower the even positions, or lower the odd positions.' },
  { id: 'even', label: 'Even valleys', description: 'Price the pattern whose valleys sit at even positions.' },
  { id: 'odd', label: 'Odd valleys', description: 'Price the pattern whose valleys sit at odd positions.' },
  { id: 'done', label: 'Result', description: 'Keep the cheaper of the two patterns.' },
]

export const code = `function minDecrements(nums) {
  const n = nums.length
  const cost = start => {
    let total = 0
    for (let i = start; i < n; i += 2) {
      const neighbours = [nums[i - 1], nums[i + 1]].filter((_, k) => (k === 0 ? i - 1 >= 0 : i + 1 < n))
      const lower = neighbours.length ? Math.min(...neighbours) : Infinity
      if (nums[i] >= lower) total += nums[i] - (lower - 1)
    }
    return total
  }
  return Math.min(cost(0), cost(1))
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

const at = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing code line: ${key}`)
  return index + 1
}
const pyAt = key => python.split('\n').findIndex(l => l.includes(key)) + 1

export const python = `def min_decrements(nums):
    n = len(nums)
    def cost(start):
        total = 0
        for i in range(start, n, 2):
            lower = min((nums[j] for j in (i - 1, i + 1) if 0 <= j < n), default=float('inf'))
            if nums[i] >= lower:
                total += nums[i] - (lower - 1)
        return total
    return min(cost(0), cost(1))`

export const inputLabel = 'Array of positive integers (JSON array)'
export const complexity = 'O(n) time: each position is priced once per pattern. The space is O(1) beyond the input.'
export const examples = [
  { label: 'Sample', input: '[6,2,9,4,7,3]' },
  { label: 'Equal values', input: '[5,5,5,5]' },
  { label: 'Single value', input: '[4]' },
]

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Enter a JSON array of 1 to 12 values.')
  nums.forEach((value, i) => {
    if (!Number.isInteger(value) || value < 1 || value > 100) throw new Error(`Value ${i + 1} must be a whole number from 1 to 100.`)
  })
  return nums
}

export function buildTrace(nums) {
  const n = nums.length
  const frames = []
  const snap = extra => ({ nums, start: null, index: null, lower: null, cut: 0, total: null, roles: null, ...extra })
  const roleFor = start => nums.map((_, i) => (i % 2 === start ? 'valley' : 'peak'))
  frames.push({
    phase: 'setup', activeLine: at('const cost = start'), pythonLine: pyAt('def min_decrements'),
    message: `${n} values. A valley must sit below both of its neighbours. Lowering a valley never affects another valley, because valleys are never next to each other.`,
    snapshot: snap(),
  })

  const totals = []
  for (const start of [0, 1]) {
    const phase = start === 0 ? 'even' : 'odd'
    const roles = roleFor(start)
    let total = 0
    for (let i = start; i < n; i += 2) {
      const neighbours = [i - 1, i + 1].filter(j => j >= 0 && j < n).map(j => nums[j])
      const lower = neighbours.length ? Math.min(...neighbours) : Infinity
      const cut = nums[i] >= lower ? nums[i] - (lower - 1) : 0
      total += cut
      const neighbourText = Number.isFinite(lower) ? `its smallest neighbour is ${lower}` : 'it has no neighbour'
      const message = cut > 0
        ? `Valley at position ${i} (value ${nums[i]}): ${neighbourText}, so lower it by ${cut} to ${lower - 1}.`
        : `Valley at position ${i} (value ${nums[i]}): ${neighbourText}, so it is already below and costs nothing.`
      frames.push({
        phase, activeLine: at(cut > 0 ? 'total += ' : 'if (nums[i] >= lower)'), pythonLine: pyAt(cut > 0 ? 'total += nums[i]' : 'if nums[i] >= lower'),
        message,
        snapshot: snap({ start, index: i, lower: Number.isFinite(lower) ? lower : null, cut, total, roles }),
      })
    }
    totals.push(total)
  }

  const result = Math.min(...totals)
  frames.push({
    phase: 'done', activeLine: at('return Math.min(cost(0)'), pythonLine: pyAt('return min(cost(0), cost(1))'),
    message: `Even-valley pattern costs ${totals[0]}, odd-valley pattern costs ${totals[1]}. The answer is ${result}.`,
    snapshot: snap({ total: result, roles: roleFor(totals[0] <= totals[1] ? 0 : 1) }),
  })
  return { input: nums, result, frames }
}
