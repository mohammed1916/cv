export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || Array.isArray(data) || !Array.isArray(data.nums) || !Number.isInteger(data.value)) throw new Error('Use {"nums": [...], "value": v}.')
  const { nums, value } = data
  if (nums.length < 1 || nums.length > 20) throw new Error('Use 1 to 20 numbers.')
  if (nums.some(x => !Number.isInteger(x) || x < -100 || x > 100)) throw new Error('Numbers are integers from -100 to 100.')
  if (value < 1 || value > 10) throw new Error('value is an integer from 1 to 10.')
  return { nums, value }
}

const residue = (x, value) => ((x % value) + value) % value

export function buildTrace(input) {
  const { nums, value } = input
  const count = new Map()
  const frames = []
  const maps = () => [{ name: 'count', keyLabel: 'remainder', valueLabel: 'numbers left', isSet: false, entries: [...count].sort((a, b) => a[0] - b[0]) }]
  frames.push({ phase: 'start', activeLine: L('count = empty map'), target: null, maps: maps(), ops: [], result: null, message: `Each number can become any number with the same remainder mod ${value}. Count how many numbers have each remainder.` })
  for (const x of nums) {
    const r = residue(x, value)
    const before = count.get(r)
    count.set(r, (before ?? 0) + 1)
    frames.push({ phase: 'count', activeLine: L('add one to count at'), target: null, maps: maps(),
      ops: [{ map: 'count', type: before === undefined ? 'insert' : 'update', key: r, value: (before ?? 0) + 1, before }],
      result: null, message: `${x} has remainder ${r}. That remainder now has ${count.get(r)} number(s).` })
  }
  let m = 0
  for (;;) {
    const r = m % value
    const left = count.get(r) ?? 0
    if (left === 0) {
      frames.push({ phase: 'missing', activeLine: L('return m'), target: m, maps: maps(),
        ops: [{ map: 'count', type: 'lookup', via: 'get', key: r, hit: false, hitNote: '', missNote: `no number is left with remainder ${r}, so ${m} cannot be built` }],
        result: m, message: `${m} needs remainder ${r}, and none is left. The answer is ${m}.` })
      return { input, result: m, frames }
    }
    count.set(r, left - 1)
    frames.push({ phase: 'use', activeLine: L('subtract one from count'), target: m, maps: maps(),
      ops: [{ map: 'count', type: 'update', key: r, value: left - 1, before: left }],
      result: null, message: `${m} uses a number with remainder ${r}. ${left - 1} of that remainder are left.` })
    m++
  }
}

export const code = `largest possible smallest missing number
count = empty map from remainder to how many numbers have it
for each number x
  add one to count at (x mod value, kept non-negative)
m = 0
repeat
  r = m mod value
  if count of r is zero then
    return m
  subtract one from count of r
  add one to m`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def find_max_mex(nums, value):
    count = {}
    for x in nums:
        r = x % value
        count[r] = count.get(r, 0) + 1
    m = 0
    while True:
        r = m % value
        if count.get(r, 0) == 0:
            return m
        count[r] -= 1
        m += 1
`
