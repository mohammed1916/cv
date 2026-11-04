export const inputLabel = 'Object with nums (positive integers) and k (1 to 5)'
export const complexity = 'O(n·k) time and O(k) space. The official limits are n up to 100000, values up to 1000000000 and k up to 5; the visualization caps nums at 12 entries so every block can be listed.'
export const examples = [
  { label: 'Example', input: '{"nums":[3,2,5,4],"k":3}' },
  { label: 'Remainders collapse', input: '{"nums":[2,6,3],"k":4}' },
  { label: 'Edge: k is 1', input: '{"nums":[7,9],"k":1}' },
]

export const phases = [
  { id: 'start', label: 'Start', description: 'No block has been seen and every count is zero.' },
  { id: 'pick', label: 'Next value', description: 'Take the next value; blocks now have to end here.' },
  { id: 'move', label: 'Extend', description: 'Every block ending at the previous index grows by this value and changes remainder.' },
  { id: 'single', label: 'New block', description: 'The value also starts a block of its own.' },
  { id: 'tally', label: 'Tally', description: 'Add the blocks ending here to the running totals.' },
  { id: 'shift', label: 'Slide', description: 'The new row becomes the previous row.' },
  { id: 'done', label: 'Result', description: 'The totals are the answer.' },
]

export const code = `set every total and every previous-row count to 0
for each value x in nums
  start an empty row for blocks ending at x
  for each remainder r
    blocks with remainder r extended by x move to r times x mod k
  x alone is one more block, with remainder x mod k
  add the row to the totals
  the row becomes the previous row
return the totals`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing pseudocode line: ${key}`)
  return index + 1
}

export const python = `def x_values(nums, k):
    totals = [0] * k
    ending = [0] * k
    for x in nums:
        next_ending = [0] * k
        for r in range(k):
            next_ending[r * x % k] += ending[r]
        next_ending[x % k] += 1
        for r in range(k):
            totals[r] += next_ending[r]
        ending = next_ending
    return totals
`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums has 1 to 12 entries.')
  for (const value of nums) {
    if (!Number.isInteger(value) || value < 1 || value > 1e9) throw new Error('Each entry of nums is an integer from 1 to 1000000000.')
  }
  if (!Number.isInteger(k) || k < 1 || k > 5) throw new Error('k is an integer from 1 to 5.')
  return { nums, k }
}

const emptyBuckets = k => Array.from({ length: k }, () => [])
const copyBuckets = buckets => buckets.map(bucket => bucket.map(block => ({ ...block })))

export function buildTrace({ nums, k }) {
  const frames = []
  const totals = Array(k).fill(0)
  let ending = Array(k).fill(0)
  let endingBlocks = emptyBuckets(k)
  const table = nums.map(() => Array(k).fill(null))
  const push = (phase, activeLine, pythonLine, message, i, row, rowBlocks, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, i, x: i >= 0 ? nums[i] : null, xMod: i >= 0 ? nums[i] % k : null,
    previous: [...ending], previousBlocks: copyBuckets(endingBlocks),
    row: row ? [...row] : null, rowBlocks: rowBlocks ? copyBuckets(rowBlocks) : null,
    totals: [...totals], table: table.map(entry => [...entry]), move: null, single: false, tallied: false, ...extra,
  })

  push('start', L('set every total'), PY('ending = [0] * k'), `All ${k} remainder counts start at 0.`, -1, null, null)
  for (let i = 0; i < nums.length; i++) {
    const x = nums[i]
    const xMod = x % k
    const row = Array(k).fill(0)
    const rowBlocks = emptyBuckets(k)
    push('pick', L('start an empty row'), PY('next_ending = [0] * k'), `x = ${x}, which is ${xMod} mod ${k}. Any block ending here is an earlier block extended by ${x}, or ${x} alone.`, i, row, rowBlocks)
    for (let r = 0; r < k; r++) {
      const to = r * x % k
      const count = ending[r]
      row[to] += count
      table[i][to] = row[to]
      for (const block of endingBlocks[r]) rowBlocks[to].push({ start: block.start, text: `${block.text}×${x}` })
      push('move', L('blocks with remainder'), PY('next_ending[r * x % k]'), count
        ? `${r} × ${x} mod ${k} = ${to}, so all ${count} block${count === 1 ? '' : 's'} with remainder ${r} move to remainder ${to}.`
        : `${r} × ${x} mod ${k} = ${to}, but no block has remainder ${r}, so nothing moves.`, i, row, rowBlocks, { move: { from: r, to, count } })
    }
    row[xMod] += 1
    table[i][xMod] = row[xMod]
    rowBlocks[xMod].push({ start: i, text: String(x) })
    push('single', L('x alone'), PY('next_ending[x % k] += 1'), `${x} on its own is a block too, with remainder ${xMod}.`, i, row, rowBlocks, { single: true })
    for (let r = 0; r < k; r++) totals[r] += row[r]
    for (let r = 0; r < k; r++) if (table[i][r] === null) table[i][r] = 0
    push('tally', L('add the row'), PY('totals[r] += next_ending[r]'), `The ${i + 1} block${i === 0 ? '' : 's'} ending at index ${i} join the totals, which are now [${totals.join(', ')}].`, i, row, rowBlocks, { tallied: true })
    push('shift', L('the row becomes'), PY('ending = next_ending'), `Only this row is needed for the next value, because a block must be contiguous.`, i, row, rowBlocks)
    ending = [...row]
    endingBlocks = copyBuckets(rowBlocks)
  }
  push('done', L('return the totals'), PY('return totals'), `Return [${totals.join(', ')}], covering all ${nums.length * (nums.length + 1) / 2} blocks.`, -1, null, null)
  return { input: { nums, k }, result: [...totals], frames }
}
