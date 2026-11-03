export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with no waiting numbers and no operations.' },
  { id: 'check', label: 'Look for partner', description: 'Work out the partner value k minus the current number and check the waiting counts.' },
  { id: 'pair', label: 'Use a partner', description: 'A waiting partner exists, so the two numbers form one operation and the partner is used up.' },
  { id: 'store', label: 'Keep number', description: 'No partner is waiting, so the current number waits for a later partner.' },
  { id: 'done', label: 'Result', description: 'The number of operations formed is the answer.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"nums": [2, 5, 3], "k": 7}.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 20 || !nums.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('nums is a list of 1 to 20 integers from 1 to 100.')
  if (!Number.isInteger(k) || k < 2 || k > 200) throw new Error('k is an integer from 2 to 200.')
  return { nums, k }
}

// Each phase points at one line of the code and one line of the Python.
const LINE = {
  start: [2, 3], check: [5, 6], pair: [7, 8], store: [9, 10], done: [10, 11],
}
const at = phase => ({ activeLine: LINE[phase][0], pythonLine: LINE[phase][1] })

export function buildTrace({ nums, k }) {
  const counts = new Map()
  let pairs = 0
  const snap = (index, value, need, outcome) => ({
    index, value, need, pairs, outcome,
    counts: [...counts].map(([value, count]) => ({ value, count })),
  })
  const frames = [{
    phase: 'start', ...at('start'), snapshot: snap(null, null, null, null),
    message: `Target sum ${k}. Scan once and keep counts of numbers that are still waiting for a partner.`,
  }]
  nums.forEach((value, index) => {
    const need = k - value
    const waiting = counts.get(need) ?? 0
    frames.push({
      phase: 'check', ...at('check'), snapshot: snap(index, value, need, null),
      message: `Index ${index} holds ${value}, so it needs ${need}. ${waiting ? `A waiting ${need} is available.` : `No waiting ${need}.`}`,
    })
    if (waiting > 0) {
      if (waiting === 1) counts.delete(need)
      else counts.set(need, waiting - 1)
      pairs += 1
      frames.push({
        phase: 'pair', ...at('pair'), snapshot: snap(index, value, need, 'paired'),
        message: `Pair ${need} with ${value}. That is one operation, so the total is ${pairs}.`,
      })
    } else {
      counts.set(value, (counts.get(value) ?? 0) + 1)
      frames.push({
        phase: 'store', ...at('store'), snapshot: snap(index, value, need, 'waiting'),
        message: `Nothing matches, so ${value} waits for a partner later.`,
      })
    }
  })
  frames.push({
    phase: 'done', ...at('done'), snapshot: snap(null, null, null, null),
    message: `${pairs} operation${pairs === 1 ? '' : 's'} formed. Numbers still waiting cannot be used.`,
  })
  return { input: { nums, k }, result: pairs, frames }
}

const codeText = `max k-sum pairs (nums, k):
  counts = empty map, pairs = 0
  for each value v in nums:
    need = k - v
    if counts[need] > 0:
      counts[need] -= 1
      pairs += 1
    else:
      counts[v] += 1
  return pairs`
export const code = codeText.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def max_operations(nums, k):
    counts = {}
    pairs = 0
    for value in nums:
        need = k - value
        if counts.get(need, 0) > 0:
            counts[need] -= 1
            pairs += 1
        else:
            counts[value] = counts.get(value, 0) + 1
    return pairs
`
