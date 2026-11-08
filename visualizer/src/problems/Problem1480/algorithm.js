export const phases = [
  { id: 'start', label: 'Start', description: 'The running sum begins at zero.' },
  { id: 'accumulate', label: 'Accumulate', description: 'Add the next value to the running total.' },
  { id: 'store', label: 'Store prefix', description: 'Store the running total as the answer at this position.' },
  { id: 'done', label: 'Complete', description: 'Every position holds the sum of the values up to it.' },
]

export const examples = [
  { label: 'Mixed signs', input: '[3,-1,4,1,-5,9]' },
  { label: 'Increasing', input: '[1,2,3,4,5]' },
  { label: 'Single value', input: '[-7]' },
  { label: 'Repeated values', input: '[5,5,5,5]' },
  { label: 'Value limits', input: '[-1000,1000,-1000,1000]' },
  { label: 'Long run: 60 values', input: '[-934,696,-997,169,149,482,-672,-896,-798,-203,61,-246,400,-683,-921,-331,-164,450,587,170,423,111,-487,-124,-459,-862,551,643,-740,-683,281,348,32,-917,-528,763,859,48,526,145,-926,488,-334,-15,451,626,-881,903,880,886,-457,-224,423,-742,-638,829,-23,475,-688,224]' },
]

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 200) throw new Error('Use a JSON array of 1 to 200 integers.')
  if (!nums.every(Number.isInteger)) throw new Error('Every value must be an integer.')
  if (!nums.every(v => v >= -1000 && v <= 1000)) throw new Error('Every value must be from -1000 to 1000.')
  return nums
}

export function buildTrace(nums) {
  const result = []
  let total = 0
  const snap = (index, extra = {}) => ({ nums, index, total, result: [...result], ...extra })
  const frames = [{ phase: 'start', activeLine: L('let total = 0'), pythonLine: P('total = 0'), snapshot: snap(-1),
    message: 'Start with a running total of 0.' }]
  for (let i = 0; i < nums.length; i++) {
    total += nums[i]
    frames.push({ phase: 'accumulate', activeLine: L('total += nums[i]'), pythonLine: P('total += nums[i]'), snapshot: snap(i),
      message: `Add ${nums[i]}: the running total is now ${total}.` })
    result.push(total)
    frames.push({ phase: 'store', activeLine: L('result.push(total)'), pythonLine: P('result.append(total)'), snapshot: snap(i),
      message: `Store ${total} at position ${i}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return result'), pythonLine: P('return result'), snapshot: snap(-1, { result: [...result] }),
    message: `Return [${result.join(', ')}].`, result })
  return { input: nums, result, frames }
}

export const code = `function runningSum(nums) {
  let total = 0, result = []
  for (let i = 0; i < nums.length; i++) {
    total += nums[i]
    result.push(total)
  }
  return result
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def running_sum(nums):
    result = []
    total = 0
    for i in range(len(nums)):
        total += nums[i]
        result.append(total)
    return result
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
