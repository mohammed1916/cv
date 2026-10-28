export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || Array.isArray(data) || !Array.isArray(data.nums)) throw new Error('Use {"nums": [...]} with 1 to 30 integers.')
  const { nums } = data
  if (nums.length < 1 || nums.length > 30) throw new Error('Use 1 to 30 numbers.')
  if (nums.some(v => !Number.isInteger(v) || v < 2 || v > 1000)) throw new Error('Numbers are integers from 2 to 1000 (1 is excluded because its square is itself).')
  return { nums }
}

export function buildTrace(input) {
  const { nums } = input
  const present = new Set(nums)
  const setMap = () => [{ name: 'present', keyLabel: 'value', valueLabel: '', isSet: true, entries: [...present].map(v => [v]) }]
  const frames = [{ phase: 'start', activeLine: L('present = set'), chain: [], maps: setMap(), ops: [], result: -1, message: 'Every value is in the set. From each value, follow squares while they stay in the set.' }]
  let best = -1
  for (const x of [...present].sort((a, b) => a - b)) {
    let length = 1
    let cur = x
    const chain = [x]
    frames.push({ phase: 'start', activeLine: L('for each value x'), chain: [...chain], maps: setMap(), ops: [], result: best, message: `Start a chain at ${x}.` })
    while (present.has(cur * cur)) {
      cur = cur * cur
      length++
      chain.push(cur)
      frames.push({ phase: 'extend', activeLine: L('cur = cur times cur'), chain: [...chain], maps: setMap(),
        ops: [{ map: 'present', type: 'lookup', via: 'has', key: cur, hit: true, hitNote: `${cur} is in the set, so the chain grows`, missNote: 'not in the set' }],
        result: best, message: `${cur} is in the set. The chain is now ${chain.join(', ')}.` })
    }
    if (length >= 2) {
      best = Math.max(best, length)
      frames.push({ phase: 'record', activeLine: L('set best to the larger'), chain: [...chain], maps: setMap(), ops: [], result: best, message: `A chain of ${length} starts at ${x}. Best so far: ${best}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), chain: [], maps: setMap(), ops: [], result: best, message: best === -1 ? 'No chain has two or more values, so the answer is -1.' : `Longest square streak: ${best}.` })
  return { input, result: best, frames }
}

export const code = `longest square streak
present = set of all values
best = -1
for each value x in increasing order
  length = 1
  cur = x
  while cur times cur is in present
    cur = cur times cur
    add one to length
  if length is at least 2 then
    set best to the larger of best and length
return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def longest_square_streak(nums):
    present = set(nums)
    best = -1
    for x in sorted(present):
        length = 1
        cur = x
        while cur * cur in present:
            cur = cur * cur
            length += 1
        if length >= 2:
            best = max(best, length)
    return best
`
