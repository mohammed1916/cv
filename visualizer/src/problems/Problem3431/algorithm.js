export const MAX_LENGTH = 16

export const phases = [
  { id: 'start', label: 'Start', description: 'No endpoints recorded yet.' },
  { id: 'scan', label: 'Scan', description: 'Visit the next value.' },
  { id: 'record', label: 'Record', description: 'Update the first or last position of a value.' },
  { id: 'check', label: 'Check', description: 'A 3 ahead of a 1 can never be fixed.' },
  { id: 'gate', label: 'Gate', description: 'Does this gate lie on a required crossing?' },
  { id: 'unlock', label: 'Unlock', description: 'A required gate is locked, so pay for it.' },
  { id: 'done', label: 'Result', description: 'Report the number of unlocks, or -1.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and locked.')
  const { nums, locked } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_LENGTH) throw new Error(`nums has 1 to ${MAX_LENGTH} entries.`)
  if (!Array.isArray(locked) || locked.length !== nums.length) throw new Error('locked has the same length as nums.')
  if (nums.some(v => v !== 1 && v !== 2 && v !== 3)) throw new Error('Each entry of nums is 1, 2 or 3.')
  if (locked.some(v => v !== 0 && v !== 1)) throw new Error('Each entry of locked is 0 or 1.')
  return { nums, locked }
}

export const code = `fewest unlocks so nums can be sorted by allowed swaps
  remember the first 2, first 3, last 1 and last 2 as absent
  for each index i with value v
    if v is the first 2 or first 3, record it
    if v is a 1 or a 2, record i as its last position
  if a 3 stands before a 1
    return -1, because they can never swap
  set unlocks to 0
  for each index i
    gate i is required if first 2 <= i < last 1 or first 3 <= i < last 2
    if gate i is required and locked
      add 1 to unlocks
  return unlocks`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}

export const python = `def min_unlocked_indices(nums, locked):
    n = len(nums)
    first = {2: n, 3: n}
    last = {1: -1, 2: -1}
    for i, v in enumerate(nums):
        if v in first and first[v] == n:
            first[v] = i
        if v in last:
            last[v] = i
    if first[3] < last[1]:
        return -1
    unlocks = 0
    for i in range(n):
        required = first[2] <= i < last[1] or first[3] <= i < last[2]
        if required and locked[i] == 1:
            unlocks += 1
    return unlocks
`

// Runs the real allowed swaps with the chosen gates open, so the answer can be shown working.
export function replaySwaps(nums, locked, opened) {
  const open = locked.map((value, i) => value === 0 || opened.includes(i))
  const array = [...nums]
  const rows = [{ values: [...array], swapAt: null }]
  for (;;) {
    let swapAt = -1
    for (let i = 0; i + 1 < array.length; i++) {
      if (array[i] - array[i + 1] === 1 && open[i]) { swapAt = i; break }
    }
    if (swapAt < 0) break
    ;[array[swapAt], array[swapAt + 1]] = [array[swapAt + 1], array[swapAt]]
    rows.push({ values: [...array], swapAt })
  }
  return rows
}

export function buildTrace({ nums, locked }) {
  const n = nums.length
  const frames = []
  const first = { 2: n, 3: n }
  const last = { 1: -1, 2: -1 }
  const opened = []
  let unlocks = 0
  const emit = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, at: -1, gate: -1, required: null, blocked: false, replay: null,
    first2: first[2] < n ? first[2] : null, first3: first[3] < n ? first[3] : null,
    last1: last[1] >= 0 ? last[1] : null, last2: last[2] >= 0 ? last[2] : null,
    unlocks, opened: [...opened], ...extra,
  })
  emit('start', L('as absent'), 4, 'Only four positions matter: first 2, last 1, first 3 and last 2.')
  for (let i = 0; i < n; i++) {
    const v = nums[i]
    emit('scan', L('for each index i with value v'), 5, `Index ${i} holds ${v}.`, { at: i })
    if ((v === 2 || v === 3) && first[v] === n) {
      first[v] = i
      emit('record', L('record it'), 7, `This is the first ${v}, at index ${i}.`, { at: i })
    }
    if (v === 1 || v === 2) {
      last[v] = i
      emit('record', L('as its last position'), 9, `The latest ${v} is now at index ${i}.`, { at: i })
    }
  }
  if (first[3] < last[1]) {
    emit('check', L('a 3 stands before a 1'), 10, `The first 3 at index ${first[3]} is ahead of the last 1 at index ${last[1]}.`, { blocked: true })
    emit('done', L('return -1'), 11, `A swap needs a difference of exactly 1, so this 3 and this 1 can never trade places. Return -1.`, { blocked: true })
    return { input: { nums, locked }, result: -1, frames }
  }
  emit('check', L('a 3 stands before a 1'), 10, 'No 3 stands before a 1, so sorting is possible.')
  emit('check', L('set unlocks'), 12, 'Now count locked gates on the required crossings, starting from 0.')
  for (let i = 0; i < n; i++) {
    const inOneTwo = first[2] <= i && i < last[1]
    const inTwoThree = first[3] <= i && i < last[2]
    const required = inOneTwo || inTwoThree
    let why
    if (i === n - 1) why = `Index ${i} has no right neighbour, so its gate is never used.`
    else if (!required) why = `No value needs to cross gate ${i}, so its state does not matter.`
    else why = `Gate ${i} is required: ${inOneTwo ? 'a 2 must move past a later 1' : 'a 3 must move past a later 2'}${locked[i] ? ', and it is locked.' : ', and it is already open.'}`
    emit('gate', L('is required if'), 14, why, { at: i, gate: i, required })
    if (required && locked[i] === 1) {
      unlocks++
      opened.push(i)
      emit('unlock', L('add 1 to unlocks'), 16, `Unlock gate ${i}. Unlocks so far: ${unlocks}.`, { at: i, gate: i, required })
    }
  }
  emit('done', L('return unlocks'), 17, unlocks === 0 ? 'Every required gate is already open. Return 0.' : `Return ${unlocks}. The swap replay shows those gates are enough.`, { replay: replaySwaps(nums, locked, opened) })
  return { input: { nums, locked }, result: unlocks, frames }
}
