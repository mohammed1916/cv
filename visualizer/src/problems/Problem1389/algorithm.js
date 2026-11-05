export const phases = [
  { id: 'start', label: 'Start', description: 'Start with an empty target array. Each step inserts one value at the given position.' },
  { id: 'insert', label: 'Insert', description: 'Insert nums[i] at position index[i]; the values to its right shift one place to the right.' },
  { id: 'done', label: 'Complete', description: 'Return the target array after every insertion.' },
]

export const examples = [
  { label: 'Plain appends', input: '{"nums":[9,2,7,4],"index":[0,1,2,3]}' },
  { label: 'Shifting inserts', input: '{"nums":[0,1,2,3,4],"index":[0,1,2,2,1]}' },
  { label: 'Front inserts', input: '{"nums":[1,2,3,4,0],"index":[0,1,2,3,0]}' },
  { label: 'Single value', input: '{"nums":[1],"index":[0]}' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.nums) || !Array.isArray(data.index)) throw new Error('Use an object with nums and index lists, such as {"nums":[0,1],"index":[0,1]}.')
  if (data.nums.length < 1 || data.nums.length > 30) throw new Error('nums must have 1 to 30 values in this visualization.')
  if (data.nums.length !== data.index.length) throw new Error('nums and index must have the same length.')
  if (!data.nums.every(Number.isInteger)) throw new Error('Every nums value must be an integer.')
  data.index.forEach((k, i) => {
    if (!Number.isInteger(k) || k < 0 || k > i) throw new Error(`index[${i}] must be a position from 0 to ${i} in the target so far.`)
  })
  return { nums: data.nums, index: data.index }
}

export function buildTrace({ nums, index }) {
  const target = []
  const snap = (extra = {}) => ({ target: [...target], ...extra })
  const frames = [{ phase: 'start', activeLine: L('const target = []'), pythonLine: P('target = []'), snapshot: snap(),
    message: `Build the target array from ${nums.length} insertions.` }]
  for (let i = 0; i < nums.length; i++) {
    target.splice(index[i], 0, nums[i])
    frames.push({ phase: 'insert', activeLine: L('target.splice'), pythonLine: P('target.insert'), snapshot: snap({ at: index[i], value: nums[i] }),
      message: `Insert ${nums[i]} at position ${index[i]}; the target is now [${target.join(', ')}].` })
  }
  frames.push({ phase: 'done', activeLine: L('return target'), pythonLine: P('return target'), snapshot: snap({ result: [...target] }),
    message: `Return [${target.join(', ')}].`, result: target })
  return { input: { nums, index }, result: [...target], frames }
}

export const code = `function createTargetArray(nums, index) {
  const target = []
  for (let i = 0; i < nums.length; i++) {
    target.splice(index[i], 0, nums[i])
  }
  return target
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 4, 6: 5, 7: 5 }

export const python = `def create_target_array(nums, index):
    target = []
    for i in range(len(nums)):
        target.insert(index[i], nums[i])
    return target
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
