// LeetCode 2172: Maximum AND Sum of Array.
// Each slot takes at most two numbers, so split every slot into two units. A bitmask over the units records
// which ones are used; f[mask] is the best AND sum that places the first popcount(mask) numbers into those units.

const MAX_SLOTS = 3
const MAX_NUMS = 6
const MAX_VALUE = 15

export function parseInput(text) {
  let spec
  try { spec = JSON.parse(text) } catch { throw new Error('Use JSON like {"nums":[1,3,5,2,4],"slots":3}.') }
  if (!spec || !Array.isArray(spec.nums) || !Number.isInteger(spec.slots)) throw new Error('Give an nums array and an integer slots.')
  if (spec.slots < 1 || spec.slots > MAX_SLOTS) throw new Error(`slots must be from 1 to ${MAX_SLOTS}. The visualization caps the slot count there.`)
  if (spec.nums.length < 1 || spec.nums.length > MAX_NUMS || spec.nums.length > 2 * spec.slots) throw new Error(`Use 1 to ${Math.min(MAX_NUMS, 2 * spec.slots)} numbers, and at most two per slot.`)
  if (!spec.nums.every(v => Number.isInteger(v) && v >= 1 && v <= MAX_VALUE)) throw new Error(`Each number is an integer from 1 to ${MAX_VALUE}.`)
  return { nums: spec.nums, slots: spec.slots }
}

export const code = `FUNCTION maximumANDSum(nums, numSlots)
    n ← length of nums
    units ← 2 * numSlots
    f ← array of 2^units zeros
    FOR mask from 0 to 2^units - 1
        cnt ← number of set bits in mask
        IF cnt > n THEN continue
        FOR each unit j that is set in mask
            slot ← floor(j / 2) + 1
            f[mask] ← max(f[mask], f[mask without j] + (nums[cnt - 1] AND slot))
    RETURN max of f`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def maximum_and_sum(nums, num_slots):
    n = len(nums)
    m = num_slots * 2
    f = [0] * (1 << m)
    for mask in range(1 << m):
        cnt = bin(mask).count("1")
        if cnt > n:
            continue
        for j in range(m):
            if mask >> j & 1:
                f[mask] = max(f[mask], f[mask ^ (1 << j)] + (nums[cnt - 1] & (j // 2 + 1)))
    return max(f)
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Units', description: 'Each slot becomes two units, so a mask can mark occupancy.' },
  { id: 'mask', label: 'Masks', description: 'For each mask, the last number placed goes into one of its set units.' },
  { id: 'done', label: 'Result', description: 'The best total over all masks.' },
]

export function buildTrace({ nums, slots }) {
  const n = nums.length
  const m = slots * 2
  const f = Array(1 << m).fill(0)
  const frames = []
  let best = 0
  const push = (phase, mask, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, mask, index: mask, activeLine, pythonLine, message, nums, slots, units: m, f: f.slice(), best, ...extra,
  })
  push('start', -1, L('units ← 2'), P('m = num_slots'), `${n} numbers and ${slots} slots, so ${m} units. Each unit takes one number.`)
  for (let mask = 0; mask < (1 << m); mask++) {
    const cnt = mask.toString(2).split('').filter(c => c === '1').length
    if (cnt > n) continue
    let bestHere = 0
    let via = -1
    for (let j = 0; j < m; j++) {
      if (!((mask >> j) & 1)) continue
      const slot = Math.floor(j / 2) + 1
      const value = f[mask ^ (1 << j)] + (nums[cnt - 1] & slot)
      if (value > bestHere || via < 0) { bestHere = value; via = j }
    }
    f[mask] = bestHere
    best = Math.max(best, f[mask])
    push('mask', mask, L('FOR each unit j'), P('for j in range(m)'),
      cnt === 0 ? `Empty mask: nothing placed, f = 0.`
        : `Mask ${mask.toString(2).padStart(m, '0')} places ${cnt} numbers. Its last number ${nums[cnt - 1]} goes to unit ${via} (slot ${Math.floor(via / 2) + 1}), giving f = ${f[mask]}.`,
      { cnt, via, placed: nums.slice(0, cnt) })
  }
  push('done', -1, L('RETURN max of f'), P('return max(f)'), `The maximum AND sum is ${best}.`)
  return { input: { nums, slots }, result: best, frames }
}
