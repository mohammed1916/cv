const MAX_VALUE = 100

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || Array.isArray(data) || !Array.isArray(data.nums) || !Array.isArray(data.operations)) throw new Error('Use {"nums": [...], "operations": [[old, new], ...]}.')
  const { nums, operations } = data
  if (nums.length < 1 || nums.length > 12) throw new Error('Use 1 to 12 numbers.')
  if (operations.length < 1 || operations.length > 10) throw new Error('Use 1 to 10 operations.')
  const bad = v => !Number.isInteger(v) || v < 1 || v > MAX_VALUE
  if (nums.some(bad)) throw new Error('Values are integers from 1 to 100.')
  if (new Set(nums).size !== nums.length) throw new Error('The starting numbers must be distinct.')
  const current = new Set(nums)
  operations.forEach((op, i) => {
    if (!Array.isArray(op) || op.length !== 2) throw new Error(`Operation ${i + 1} must be [old, new].`)
    const [oldValue, newValue] = op
    if (bad(oldValue) || bad(newValue)) throw new Error(`Operation ${i + 1} holds values from 1 to 100.`)
    if (!current.has(oldValue)) throw new Error(`Operation ${i + 1}: ${oldValue} is not in the array.`)
    if (current.has(newValue)) throw new Error(`Operation ${i + 1}: ${newValue} is already in the array.`)
    current.delete(oldValue)
    current.add(newValue)
  })
  return { nums, operations }
}

export function buildTrace(input) {
  const nums = [...input.nums]
  const position = new Map()
  nums.forEach((v, i) => position.set(v, i))
  const maps = () => [{ name: 'position', keyLabel: 'value', valueLabel: 'index', isSet: false, entries: [...position] }]
  const frames = [{ phase: 'start', activeLine: L('position is an empty map'), index: -1, maps: maps(), ops: [], nums: [...nums], result: [...nums], message: 'Record where each starting value sits, so a replacement can jump straight to its slot.' }]
  input.operations.forEach(([oldValue, newValue]) => {
    const i = position.get(oldValue)
    nums[i] = newValue
    position.delete(oldValue)
    position.set(newValue, i)
    frames.push({ phase: 'replace', activeLine: L('set nums[i] to new'), index: i, maps: maps(),
      ops: [
        { map: 'position', type: 'lookup', via: 'get', key: oldValue, hit: true, value: i, hitNote: 'the table gives the slot of the value to replace', missNote: 'never reached: operations always name a present value' },
        { map: 'position', type: 'delete', key: oldValue, existed: true, before: i },
        { map: 'position', type: 'insert', key: newValue, value: i },
      ], nums: [...nums], result: [...nums],
      message: `Replace ${oldValue} with ${newValue} at index ${i}. The table now maps ${newValue} to ${i}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return nums'), index: -1, maps: maps(), ops: [], nums: [...nums], result: [...nums], message: `Final array: [${nums.join(', ')}].` })
  return { input, result: [...nums], frames }
}

export const code = `replace elements using a position table
position is an empty map from value to its index in nums
for each index i with value v in nums
  set position of v to i
for each operation [old, new]
  i = position of old
  set nums[i] to new
  remove old from position
  set position of new to i
return nums`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def replace_elements(nums, operations):
    nums = list(nums)
    position = {}
    for i, v in enumerate(nums):
        position[v] = i
    for old, new in operations:
        i = position.pop(old)
        nums[i] = new
        position[new] = i
    return nums
`
