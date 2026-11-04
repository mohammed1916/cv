const MAX_LENGTH = 24
const INT_MIN = -(2 ** 31)
const INT_MAX = 2 ** 31 - 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 3 || nums.length > MAX_LENGTH) throw new Error(`nums has 3 to ${MAX_LENGTH} entries.`)
  const counts = new Map()
  for (const value of nums) {
    if (!Number.isInteger(value) || value < INT_MIN || value > INT_MAX) throw new Error('Each entry is a 32-bit integer.')
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }
  const tally = [...counts.values()]
  const ok = tally.filter(c => c === 1).length === 1 && tally.filter(c => c === 2).length === 1 && tally.every(c => c >= 1 && c <= 3)
  if (!ok) throw new Error('Exactly one value occurs once, exactly one occurs twice and all others occur three times.')
  return { nums }
}

// Columns needed so every value, and every mask built from them, reads correctly.
// With negatives the leftmost column is the sign bit, standing for all higher bits.
export function bitWidth(nums) {
  const bits = v => 32 - Math.clz32(v >= 0 ? v : ~v)
  const widest = Math.max(1, ...nums.map(bits))
  return Math.min(32, nums.some(v => v < 0) ? widest + 1 : widest)
}

const absorb = (ones, twos, v) => {
  const nextOnes = (ones ^ v) & ~twos
  const nextTwos = (twos ^ v) & ~nextOnes
  return [nextOnes, nextTwos]
}

export function buildTrace({ nums }) {
  const frames = []
  let ones = 0
  let twos = 0
  let diff = null
  let pick = null
  let firstPass = null
  const groups = [{ ones: 0, twos: 0, members: [] }, { ones: 0, twos: 0, members: [] }]
  const snapshot = () => groups.map(g => ({ ones: g.ones, twos: g.twos, members: g.members.slice() }))
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine: L(activeLine), pythonLine: P(pythonLine), message,
    pass: 1, at: -1, v: null, ones, twos, prevOnes: ones, prevTwos: twos, diff, pick, firstPass, groups: snapshot(), group: -1, x: null, y: null, ...extra,
  })

  push('start', 'start both masks at zero', 'ones = twos = 0', 'For every bit column, ones and twos together store how many times that bit was seen, modulo 3.')
  nums.forEach((v, at) => {
    push('read', 'for each value v', 'for v in nums', `Read ${v}. Each of its 1 bits advances that column by one count.`, { at, v })
    const prevOnes = ones
    const prevTwos = twos
    ;[ones, twos] = absorb(ones, twos, v)
    push('count', 'advance every column', 'ones = (ones ^ v)', `Columns with a 1 in ${v} step 0 to 1 to 2 and back to 0. A third sighting clears the column.`, { at, v, prevOnes, prevTwos })
  })
  firstPass = { ones, twos }
  diff = ones | twos
  push('diff', 'combine the masks', 'diff = ones | twos', 'A bit held by both special values counts 1 + 2 = 3 and has vanished, so these masks are not the answers yet. A surviving column is one where the two values differ.', { pass: 0 })
  pick = diff & -diff
  push('pick', 'keep one differing bit', 'pick = diff & -diff', `Keep the lowest differing bit, ${columnName(pick)}. The two special values disagree there, so splitting by it separates them.`, { pass: 0 })

  nums.forEach((v, at) => {
    const group = (v & pick) !== 0 ? 1 : 0
    push('route', 'choose the group', 'if v & pick', `${v} has a ${group} at ${columnName(pick)}, so it joins group ${group}. Equal values always land together.`, { pass: 2, at, v, group })
    const target = groups[group]
    const prevOnes = target.ones
    const prevTwos = target.twos
    ;[target.ones, target.twos] = absorb(target.ones, target.twos, v)
    target.members.push(v)
    push('group', 'count v inside its group', group === 1 ? 'ones1 = (ones1 ^ v)' : 'ones0 = (ones0 ^ v)', `Group ${group} counts ${v}. Each group now holds exactly one special value, so no column can cancel.`, { pass: 2, at, v, group, prevOnes, prevTwos })
  })

  const onceInGroup1 = (groups[1].ones & pick) !== 0
  const x = onceInGroup1 ? groups[1].ones : groups[0].ones
  const y = onceInGroup1 ? groups[0].twos : groups[1].twos
  push('decode', 'look at group 1', 'if ones1 & pick',
    onceInGroup1
      ? `Group 1 has its pick bit in ones, so the value seen once lives there: ${x}. Group 0 holds the value seen twice in twos: ${y}.`
      : `Group 1 has its pick bit in twos, so the value seen twice lives there: ${y}. Group 0 holds the value seen once in ones: ${x}.`,
    { pass: 0, x, y })
  push('done', 'return the pair', onceInGroup1 ? 'return [ones1, twos0]' : 'return [ones0, twos1]', `Return [${x}, ${y}]: ${x} occurs once and ${y} occurs twice.`, { pass: 0, x, y })
  return { input: { nums }, result: [x, y], frames }
}

function columnName(mask) {
  return `bit ${31 - Math.clz32(mask)}`
}

export const phases = [
  { id: 'start', label: 'Start', description: 'Both masks begin empty.' },
  { id: 'read', label: 'Read', description: 'First pass: take the next value.' },
  { id: 'count', label: 'Count', description: 'Advance each touched column modulo 3.' },
  { id: 'diff', label: 'Differ', description: 'Find the columns where the two values differ.' },
  { id: 'pick', label: 'Pick bit', description: 'Keep one differing bit to split on.' },
  { id: 'route', label: 'Route', description: 'Second pass: choose a group by the picked bit.' },
  { id: 'group', label: 'Group count', description: 'Count the value modulo 3 inside its group.' },
  { id: 'decode', label: 'Decode', description: 'Each group now reveals one value.' },
  { id: 'done', label: 'Result', description: 'Return the pair.' },
]

export const code = `find the value seen once and the value seen twice
  start both masks at zero
  for each value v
    advance every column where v has a 1, modulo 3
  combine the masks: a surviving column means the two values differ there
  keep one differing bit
  for each value v again
    choose the group by that bit
    count v inside its group, modulo 3
  look at group 1: if the bit is in its ones mask it holds the once value
  return the pair (once, twice)`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}

export const python = `def once_twice(nums):
    ones = twos = 0
    for v in nums:
        ones = (ones ^ v) & ~twos
        twos = (twos ^ v) & ~ones
    diff = ones | twos
    pick = diff & -diff
    ones0 = twos0 = ones1 = twos1 = 0
    for v in nums:
        if v & pick:
            ones1 = (ones1 ^ v) & ~twos1
            twos1 = (twos1 ^ v) & ~ones1
        else:
            ones0 = (ones0 ^ v) & ~twos0
            twos0 = (twos0 ^ v) & ~ones0
    if ones1 & pick:
        return [ones1, twos0]
    return [ones0, twos1]
`

const pythonLines = python.split('\n')
const P = s => {
  const index = pythonLines.findIndex(text => text.includes(s))
  if (index < 0) throw new Error(`Python line missing: ${s}`)
  return index + 1
}
