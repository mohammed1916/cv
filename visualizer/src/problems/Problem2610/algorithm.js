export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 16) throw new Error('Use a JSON array of 1 to 16 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 8)) throw new Error('Values are integers from 1 to 8.')
  return nums
}

export function buildTrace(nums) {
  const rows = []
  const used = new Map()
  const snapshot = () => rows.map(row => [...row])
  const frames = [{ phase: 'start', activeLine: L('rows = empty list'), value: null, row: -1, rows: [], message: 'Start with no rows.' }]
  for (let index = 0; index < nums.length; index++) {
    const x = nums[index]
    const r = used.get(x) ?? 0
    let opened = false
    if (r === rows.length) {
      rows.push([])
      opened = true
    }
    rows[r].push(x)
    used.set(x, r + 1)
    frames.push({ phase: opened ? 'open' : 'place', activeLine: opened ? L('add an empty row') : L('add x to rows[r]'), index, value: x, row: r, rows: snapshot(), message: `${x} is occurrence ${r + 1} of its value, so it goes in row ${r}${opened ? ' (a new row is opened)' : ''}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return rows'), value: null, row: -1, rows: snapshot(), message: `${rows.length} row${rows.length === 1 ? '' : 's'}, each with distinct values.` })
  return { input: nums, result: rows, frames }
}

export const code = `rows with distinct values
  rows = empty list of rows
  used = count of each value placed so far
  for each value x in nums
    r = used[x]
    if r is the number of rows then
      add an empty row to rows
    add x to rows[r]
    used[x] = used[x] + 1
  return rows`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import Counter

def convert_to_distinct_rows(nums):
    rows = []
    used = Counter()
    for x in nums:
        r = used[x]
        if r == len(rows):
            rows.append([])
        rows[r].append(x)
        used[x] += 1
    return rows
`
