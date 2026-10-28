export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || Array.isArray(data) || !Array.isArray(data.nums)) throw new Error('Use {"nums": [...]} with 1 to 30 distinct nonzero integers.')
  const { nums } = data
  if (nums.length < 1 || nums.length > 30) throw new Error('Use 1 to 30 numbers.')
  if (nums.some(v => !Number.isInteger(v) || v === 0 || v < -1000 || v > 1000)) throw new Error('Numbers are nonzero integers from -1000 to 1000.')
  if (new Set(nums).size !== nums.length) throw new Error('The numbers must be distinct.')
  return { nums }
}

export function buildTrace(input) {
  const { nums } = input
  const seen = new Set(nums)
  const setMap = () => [{ name: 'seen', keyLabel: 'value', valueLabel: '', isSet: true, entries: nums.filter(v => seen.has(v)).map(v => [v]) }]
  const frames = [{ phase: 'start', activeLine: L('seen = set'), index: -1, maps: setMap(), ops: [], result: -1, message: 'Put every number in the set. A positive k pairs with -k exactly when -k is in the set.' }]
  let best = -1
  nums.forEach((x, i) => {
    if (x > 0) {
      const hit = seen.has(-x)
      if (hit) best = Math.max(best, x)
      frames.push({ phase: hit ? 'match' : 'check', activeLine: hit ? L('set best to the larger') : L('if x is positive'), index: i, maps: setMap(),
        ops: [{ map: 'seen', type: 'lookup', via: 'has', key: -x, hit, hitNote: `${-x} is present, so ${x} qualifies`, missNote: `${-x} is absent, so ${x} does not qualify` }],
        result: best, message: hit ? `${x} and ${-x} are both present. Best so far: ${best}.` : `${x} has no ${-x} in the set.` })
    } else {
      frames.push({ phase: 'skip', activeLine: L('if x is positive'), index: i, maps: setMap(), ops: [], result: best, message: `${x} is not positive, so it is not a candidate.` })
    }
  })
  frames.push({ phase: 'done', activeLine: L('return best'), index: -1, maps: setMap(), ops: [], result: best, message: best === -1 ? 'No positive number has its negative, so the answer is -1.' : `Largest such positive: ${best}.` })
  return { input, result: best, frames }
}

export const code = `largest k where both k and negative k are present
seen = set of all numbers
best = -1
for each number x
  if x is positive and negative x is in seen then
    set best to the larger of best and x
return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def find_max_k(nums):
    seen = set(nums)
    best = -1
    for x in nums:
        if x > 0 and -x in seen:
            best = max(best, x)
    return best
`
