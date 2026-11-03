const MAX_LENGTH = 8

const P = s => {
  const i = python.split('\n').findIndex(line => line.includes(s))
  if (i < 0) throw new Error(`missing python line: ${s}`)
  return i + 1
}
const L = s => {
  const i = code.findIndex(c => c.text.includes(s))
  if (i < 0) throw new Error(`missing pseudocode line: ${s}`)
  return i + 1
}

const TARGET_NAMES = ['zero first', 'zero last']

// Where the item with this value must end up under the given accepted arrangement.
const targetSlot = (value, n, zeroFirst) => (zeroFirst ? value : value === 0 ? n - 1 : value - 1)

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_LENGTH) throw new Error(`Use a permutation of 0 to n-1 with n from 1 to ${MAX_LENGTH}.`)
  const sorted = [...nums].sort((a, b) => a - b)
  if (!sorted.every((v, i) => v === i)) throw new Error('The list must be a permutation of 0 through n minus 1.')
  return nums
}

export function buildTrace(nums) {
  const n = nums.length
  const frames = []
  const totals = [null, null]
  let best = null
  const frame = extra => ({ target: -1, cycle: [], hasZero: false, cycleCost: null, totals: [...totals], best, slots: nums.map(v => targetSlot(v, n, true)), result: null, ...extra })

  frames.push(frame({ phase: 'start', activeLine: L('minimum moves to sort'), pythonLine: P('n = len'), message: 'Two arrangements are accepted: zero first, or zero last. We cost each and keep the cheaper.' }))

  for (let t = 0; t < 2; t++) {
    const zeroFirst = t === 0
    const slots = nums.map(v => targetSlot(v, n, zeroFirst))
    frames.push(frame({ phase: 'target', target: t, slots, activeLine: L('for each target arrangement'), pythonLine: P('for zero_first in'), message: `Target ${TARGET_NAMES[t]}: each item moves to its own slot.` }))
    const seen = Array(n).fill(false)
    let total = 0
    for (let start = 0; start < n; start++) {
      if (seen[start]) continue
      const cycle = []
      let hasZero = false
      let i = start
      while (!seen[i]) {
        seen[i] = true
        cycle.push(i)
        if (nums[i] === 0) hasZero = true
        i = slots[i]
      }
      if (cycle.length > 1) {
        const cost = hasZero ? cycle.length - 1 : cycle.length + 1
        total += cost
        frames.push(frame({ phase: 'cycle', target: t, slots, cycle: [...cycle], hasZero, cycleCost: cost, activeLine: L('follow the cycle'), pythonLine: P('if length > 1'), message: `Cycle ${cycle.join(' → ')} ${hasZero ? 'holds the zero' : 'does not hold the zero'}, so it costs ${cost}.` }))
      }
    }
    totals[t] = total
    if (best === null || total < best) best = total
    frames.push(frame({ phase: 'keep', target: t, slots, totals: [...totals], best, activeLine: L('keep the smaller total'), pythonLine: P('best = total'), message: `${TARGET_NAMES[t]} needs ${total} move${total === 1 ? '' : 's'}; the best so far is ${best}.` }))
  }
  frames.push(frame({ phase: 'done', totals: [...totals], best, result: best, activeLine: L('return best'), pythonLine: P('return best'), message: `The minimum number of moves is ${best}.` }))
  return { input: nums, result: best, frames }
}

export const code = [
  'minimum moves to sort with the empty slot',
  'best is unset',
  'for each target arrangement, zero first or zero last',
  '  mark every position as unseen',
  '  for each unseen position start',
  '    follow the cycle of slots from start',
  '    cycle length is the number of positions visited',
  '    if the cycle holds the zero then cost is length minus one, else length plus one',
  '  keep the smaller total as best',
  'return best',
].map((text, index) => ({ line: index + 1, text }))

export const python = `def min_moves_to_sort(nums):
    n = len(nums)
    best = None
    for zero_first in (True, False):
        seen = [False] * n
        total = 0
        for start in range(n):
            if seen[start]:
                continue
            length = 0
            has_zero = False
            i = start
            while not seen[i]:
                seen[i] = True
                length += 1
                if nums[i] == 0:
                    has_zero = True
                if zero_first:
                    i = nums[i]
                else:
                    i = n - 1 if nums[i] == 0 else nums[i] - 1
            if length > 1:
                total += length - 1 if has_zero else length + 1
        if best is None or total < best:
            best = total
    return best
`
