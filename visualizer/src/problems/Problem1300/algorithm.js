export const phases = [
  { id: 'start', label: 'Search range', description: 'Any cap from 0 up to the largest element is a candidate. Capped sums never decrease as the cap grows, so binary search applies.' },
  { id: 'probe', label: 'Probe cap', description: 'Try the middle cap and add up the array with every value above it replaced by that cap.' },
  { id: 'narrow', label: 'Narrow range', description: 'If the capped sum is still short of the target, the cap must rise; otherwise the answer is at or below this cap.' },
  { id: 'compare', label: 'Compare neighbours', description: 'The first cap that reaches the target and the cap just below it are the only candidates. Compare their distances to the target.' },
  { id: 'done', label: 'Complete', description: 'The chosen cap has the smallest distance to the target, with ties going to the smaller cap.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"arr": [1, 5, 9, 2], "target": 14}.')
  const { arr, target } = input
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 20 || !arr.every(v => Number.isInteger(v) && v >= 0 && v <= 30)) throw new Error('arr is a list of 1 to 20 integers from 0 to 30.')
  if (!Number.isInteger(target) || target < 0 || target > 300) throw new Error('target is an integer from 0 to 300.')
  return { arr, target }
}

const cappedSum = (arr, cap) => arr.reduce((sum, v) => sum + Math.min(v, cap), 0)

export function buildTrace({ arr, target }) {
  const frames = []
  const frame = (phase, line, message, snapshot, pyLine = line) => frames.push({ phase, activeLine: L(line), pythonLine: P(pyLine), snapshot, message })
  let low = 0
  let high = Math.max(...arr)
  const base = { arr: [...arr], target, low, high, mid: null, midSum: null, belowSum: null, lowSum: null }
  frame('start', 'high = max(arr)', `Caps range from ${low} to ${high}. The target is ${target}.`, { ...base }, 'max(arr)')
  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    const midSum = cappedSum(arr, mid)
    frame('probe', 'mid = (low + high)', `Try cap ${mid}: the capped sum is ${midSum}.`, { ...base, low, high, mid, midSum })
    if (midSum < target) {
      low = mid + 1
      frame('narrow', 'low = mid + 1', `${midSum} is short of ${target}, so the cap must be larger. Search above ${mid}.`, { ...base, low, high, mid, midSum })
    } else {
      high = mid
      frame('narrow', 'high = mid', `${midSum} reaches ${target}, so the answer is at most ${mid}.`, { ...base, low, high, mid, midSum })
    }
  }
  const lowSum = cappedSum(arr, low)
  const belowSum = low > 0 ? cappedSum(arr, low - 1) : null
  const useBelow = low > 0 && Math.abs(belowSum - target) <= Math.abs(lowSum - target)
  frame('compare', 'if low > 0 and', `Cap ${low} gives sum ${lowSum}; cap ${low - 1} gives ${belowSum ?? 'no cap'}. Distances ${Math.abs(lowSum - target)} and ${belowSum === null ? '—' : Math.abs(belowSum - target)}.`, { ...base, low, high, lowSum, belowSum })
  const result = useBelow ? low - 1 : low
  frame('done', useBelow ? 'return low - 1' : '# nearest', `The best cap is ${result}.`, { ...base, low, high, lowSum, belowSum, result }, useBelow ? 'return low - 1' : '# nearest')
  return { input: { arr: [...arr], target }, result, frames }
}

export const code = `closest cap (arr, target):
  low = 0; high = max(arr)
  while low < high:
    mid = (low + high) // 2
    if capped_sum(arr, mid) < target: low = mid + 1
    else: high = mid
  if low > 0 and |capped_sum(arr, low - 1) - target| <= |capped_sum(arr, low) - target|:
    return low - 1
  return low  # nearest cap`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def closest_cap(arr, target):
    low, high = 0, max(arr)
    while low < high:
        mid = (low + high) // 2
        if capped_sum(arr, mid) < target:
            low = mid + 1
        else:
            high = mid
    if low > 0 and abs(capped_sum(arr, low - 1) - target) <= abs(capped_sum(arr, low) - target):
        return low - 1
    return low  # nearest cap`

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
