export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums, k, op1 and op2.')
  const { nums, k, op1, op2 } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 6 || !nums.every(x => Number.isInteger(x) && x >= 1 && x <= 30)) throw new Error('nums has 1 to 6 integers from 1 to 30.')
  if (!Number.isInteger(k) || k < 1 || k > 15) throw new Error('k is an integer from 1 to 15.')
  if (![op1, op2].every(v => Number.isInteger(v) && v >= 0 && v <= 4)) throw new Error('op1 and op2 are integers from 0 to 4.')
  return { nums, k, op1, op2 }
}

// Each element chooses one of four fates: none, halve, subtract k, or both (in the better order).
export function bestOptions(x, k) {
  const halved = Math.ceil(x / 2)
  const options = [
    { name: 'none', value: x, use1: 0, use2: 0 },
    { name: 'halve', value: halved, use1: 1, use2: 0 },
  ]
  if (x >= k) options.push({ name: 'subtract', value: x - k, use1: 0, use2: 1 })
  const both = []
  if (x >= k) both.push({ name: 'subtract then halve', value: Math.ceil((x - k) / 2), use1: 1, use2: 1 })
  if (halved >= k) both.push({ name: 'halve then subtract', value: halved - k, use1: 1, use2: 1 })
  if (both.length) options.push(both.reduce((a, b) => (b.value < a.value ? b : a)))
  return options
}

export function buildTrace({ nums, k, op1, op2 }) {
  const frames = []
  // table maps "used1,used2" to the smallest sum reachable with exactly that usage so far
  let table = new Map([['0,0', 0]])
  frames.push({ pythonLine: P('table = {'), phase: 'start', activeLine: L('let table = new Map'), at: -1, table: snapshot(table), message: 'No operations used and sum 0 so far.' })
  for (let i = 0; i < nums.length; i++) {
    frames.push({ pythonLine: P('for x in nums'), phase: 'element', activeLine: L('for (const x of nums)'), at: i, table: snapshot(table), message: `Element ${nums[i]}: list its fates.` })
    const next = new Map()
    for (const [key, sum] of table) {
      const [u1, u2] = key.split(',').map(Number)
      for (const option of bestOptions(nums[i], k)) {
        const n1 = u1 + option.use1
        const n2 = u2 + option.use2
        if (n1 > op1 || n2 > op2) continue
        const nkey = `${n1},${n2}`
        const value = sum + option.value
        if (!next.has(nkey) || value < next.get(nkey)) next.set(nkey, value)
      }
    }
    table = next
    frames.push({ pythonLine: P('table = nxt'), phase: 'update', activeLine: L('table = next'), at: i, table: snapshot(table), message: `Kept ${table.size} usage pattern(s) after element ${nums[i]}.` })
  }
  const result = Math.min(...table.values())
  frames.push({ pythonLine: P('return min'), phase: 'done', activeLine: L('return Math.min'), at: -1, table: snapshot(table), result, message: `Minimum possible sum is ${result}.` })
  return { input: { nums, k, op1, op2 }, result, frames }
}

function snapshot(table) {
  return [...table].map(([key, sum]) => ({ key, sum })).sort((a, b) => a.key.localeCompare(b.key))
}

export const code = `function minArraySum(nums, k, op1, op2) {
  let table = new Map([['0,0', 0]])
  for (const x of nums) {
    const next = new Map()
    for (const [key, total] of table) {
      const [u1, u2] = key.split(',').map(Number)
      for (const option of bestOptions(x, k)) {
        const n1 = u1 + option.use1
        const n2 = u2 + option.use2
        if (n1 > op1 || n2 > op2) continue
        const nkey = \`\${n1},\${n2}\`
        const value = total + option.value
        if (!next.has(nkey) || value < next.get(nkey)) next.set(nkey, value)
      }
    }
    table = next
  }
  return Math.min(...table.values())
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_array_sum(nums, k, op1, op2):
    table = {(0, 0): 0}
    for x in nums:
        nxt = {}
        for (u1, u2), total in table.items():
            for value, use1, use2 in fates(x, k):
                n1, n2 = u1 + use1, u2 + use2
                if n1 > op1 or n2 > op2:
                    continue
                best = total + value
                if best < nxt.get((n1, n2), best + 1):
                    nxt[(n1, n2)] = best
        table = nxt
    return min(table.values())`
const P = s => python.split('\n').findIndex(line => line.includes(s)) + 1
