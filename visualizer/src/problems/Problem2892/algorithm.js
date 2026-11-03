const PHASES = [
  { id: 'start', label: 'Start', description: 'No group is open yet.' },
  { id: 'consider', label: 'Consider', description: 'Test whether the next value can join the open group.' },
  { id: 'merge', label: 'Join', description: 'The product stays at most k, so the value joins the group.' },
  { id: 'split', label: 'New group', description: 'Joining would exceed k, so a new group starts here.' },
  { id: 'done', label: 'Result', description: 'The number of groups is the final array length.' },
]

export const phases = PHASES

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 20) throw new Error('nums has 1 to 20 values.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 1000)) throw new Error('Each nums value is an integer from 1 to 1000.')
  if (!Number.isInteger(k) || k < 1 || k > 1000000) throw new Error('k is an integer from 1 to 1000000.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const frames = []
  let groups = 0
  let product = 1
  let starts = []
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('set groups to 0'), index: -1, value: null, candidate: null, groups, product, starts: [], message: `No group is open. k = ${k}.` })
  for (let i = 0; i < nums.length; i += 1) {
    const x = nums[i]
    const open = groups > 0
    const candidate = open ? product * x : null
    frames.push({ pythonLine: 4, phase: 'consider', activeLine: L('for each value x'), index: i, value: x, candidate, groups, product, starts: [...starts], message: open
      ? `Test ${product} × ${x} = ${candidate} against k = ${k}.`
      : `Nothing is open, so ${x} starts the first group.` })
    if (open && candidate <= k) {
      product = candidate
      frames.push({ pythonLine: 5, phase: 'merge', activeLine: L('multiply product by x'), index: i, value: x, candidate, groups, product, starts: [...starts], message: `${candidate} ≤ ${k}: ${x} joins the group, product is now ${product}.` })
    } else {
      groups += 1
      product = x
      starts = [...starts, i]
      frames.push({ pythonLine: 8, phase: 'split', activeLine: L('start a new group'), index: i, value: x, candidate, groups, product, starts: [...starts], message: open
        ? `${candidate} > ${k}: ${x} starts group ${groups}.`
        : `${x} starts group ${groups}.` })
    }
  }
  frames.push({ pythonLine: 10, phase: 'done', activeLine: L('return groups'), index: -1, value: null, candidate: null, groups, product, starts: [...starts], message: `${groups} group${groups === 1 ? '' : 's'}: the final array has length ${groups}.` })
  return { input: { nums, k }, result: groups, frames }
}

export const code = `minimum final length after replacing adjacent pairs by their product when product is at most k
  set groups to 0 and product to 1
  for each value x in nums from left to right
    if a group is open and product times x is at most k then
      multiply product by x so x joins the open group
    else
      start a new group with product x and add one to groups
  return groups`.split('\n').map((text, index) => ({ line: index + 1, text }))

function L(s) {
  const i = code.findIndex(c => c.text.includes(s))
  if (i < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return i + 1
}

export const python = `def min_final_length(nums, k):
    groups = 0
    product = 1
    for x in nums:
        if groups > 0 and product * x <= k:
            product *= x
        else:
            groups += 1
            product = x
    return groups
`
