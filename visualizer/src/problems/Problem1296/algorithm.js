export const phases = [
  { id: 'start', label: 'Start', description: 'Check that the array length is a multiple of k.' },
  { id: 'count', label: 'Count values', description: 'Record how many copies of each value there are.' },
  { id: 'group', label: 'Open a group', description: 'Take the smallest value that still has copies; it must start a run of k consecutive values.' },
  { id: 'take', label: 'Take a run', description: 'Remove one run of k consecutive values starting here, from the smallest value upward.' },
  { id: 'fail', label: 'Missing value', description: 'A value in the run has too few copies, so the array cannot be divided.' },
  { id: 'done', label: 'Complete', description: 'Every value was placed in a run of k consecutive numbers.' },
]

export const examples = [
  { label: 'Two runs of three', input: '{"nums":[5,3,1,2,6,4],"k":3}' },
  { label: 'Gap in the middle', input: '{"nums":[1,2,3,5,6,7],"k":3}' },
  { label: 'Repeated values', input: '{"nums":[1,1,2,2,3,3],"k":3}' },
  { label: 'Single value', input: '{"nums":[4],"k":1}' },
  { label: 'Equal values', input: '{"nums":[2,2,2],"k":2}' },
  { label: 'Long run: 40 values', input: '{"nums":[657,555,493,163,276,330,853,527,256,141,3,325,687,730,266,315,62,387,856,843,697,725,847,194,619,820,884,172,321,420,986,516,423,776,879,951,137,805,213,185],"k":10}' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with a nums list and an integer k, such as {"nums":[1,2,3,4],"k":2}.')
  if (!Array.isArray(data.nums) || data.nums.length < 1 || data.nums.length > 40) throw new Error('nums is a list of 1 to 40 values in this visualization.')
  if (!data.nums.every(v => Number.isInteger(v) && v >= 1 && v <= 1000)) throw new Error('Every value must be an integer from 1 to 1000.')
  if (!Number.isInteger(data.k) || data.k < 1 || data.k > data.nums.length) throw new Error('k is an integer from 1 to the length of nums.')
  return { nums: data.nums, k: data.k }
}

export function buildTrace({ nums, k }) {
  const frames = []
  const sorted = [...nums].sort((a, b) => a - b)
  const count = new Map()
  const rows = () => [...count.keys()].sort((a, b) => a - b).map(v => ({ value: v, count: count.get(v) }))
  const scene = (extra = {}) => ({ sorted, remaining: rows(), groupStart: null, groupEnd: null, current: null, ...extra })
  frames.push({ phase: 'start', activeLine: L('if (nums.length % k'), pythonLine: P('if len(nums) % k'), snapshot: scene(),
    message: `${nums.length} values must split into groups of ${k}. ${nums.length % k === 0 ? 'The length divides evenly, so keep going.' : 'The length does not divide evenly, so the answer is false.'}` })
  if (nums.length % k !== 0) {
    frames.push({ phase: 'done', activeLine: L('return false'), pythonLine: P('return False'), snapshot: scene(), message: 'Return false.', result: false })
    return { input: { nums, k }, result: false, frames }
  }
  for (const x of nums) count.set(x, (count.get(x) || 0) + 1)
  frames.push({ phase: 'count', activeLine: L('for (const x of nums)'), pythonLine: P('count = Counter'), snapshot: scene(),
    message: `Counted ${count.size} distinct values. Groups will be taken starting from the smallest value.` })
  const keys = [...count.keys()].sort((a, b) => a - b)
  for (const start of keys) {
    const need = count.get(start)
    if (need === 0) continue
    frames.push({ phase: 'group', activeLine: L('for (const start of keys)'), pythonLine: P('for start in sorted'), snapshot: scene({ groupStart: start, groupEnd: start + k - 1, current: start }),
      message: `${start} is the smallest value left, with ${need} cop${need === 1 ? 'y' : 'ies'}. Each needs a run ${start} to ${start + k - 1}.` })
    for (let v = start; v < start + k; v++) {
      const left = count.get(v) || 0
      if (left < need) {
        frames.push({ phase: 'fail', activeLine: L('if (left < need)'), pythonLine: P('if count[v] < need'), snapshot: scene({ groupStart: start, groupEnd: start + k - 1, current: v }),
          message: `${v} has ${left} cop${left === 1 ? 'y' : 'ies'} left but the run needs ${need}. The array cannot be divided, so return false.`, verdict: false })
        frames.push({ phase: 'done', activeLine: L('return false'), pythonLine: P('return False'), snapshot: scene(), message: 'Return false.', result: false })
        return { input: { nums, k }, result: false, frames }
      }
      count.set(v, left - need)
      frames.push({ phase: 'take', activeLine: L('count.set(v'), pythonLine: P('count[v] -= need'), snapshot: scene({ groupStart: start, groupEnd: start + k - 1, current: v }),
        message: `Take ${need} cop${need === 1 ? 'y' : 'ies'} of ${v}; ${left - need} remain.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return true'), pythonLine: P('return True'), snapshot: scene(), message: 'Every value was placed in a run of consecutive numbers. Return true.', result: true })
  return { input: { nums, k }, result: true, frames }
}

export const code = `function isPossibleDivide(nums, k) {
  if (nums.length % k !== 0) return false
  const count = new Map()
  for (const x of nums) count.set(x, (count.get(x) || 0) + 1)
  const keys = [...count.keys()].sort((a, b) => a - b)
  for (const start of keys) {
    const need = count.get(start)
    if (need === 0) continue
    for (let v = start; v < start + k; v++) {
      const left = count.get(v) || 0
      if (left < need) return false
      count.set(v, left - need)
    }
  }
  return true
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import Counter

def is_possible_divide(nums, k):
    if len(nums) % k != 0:
        return False
    count = Counter(nums)
    for start in sorted(count):
        need = count[start]
        if need == 0:
            continue
        for v in range(start, start + k):
            if count[v] < need:
                return False
            count[v] -= need
    return True
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
