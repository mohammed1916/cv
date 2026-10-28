export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || Array.isArray(data) || !Array.isArray(data.nums)) throw new Error('Use {"nums": [...]} with 1 to 30 positive integers.')
  const { nums } = data
  if (nums.length < 1 || nums.length > 30) throw new Error('Use 1 to 30 numbers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 1000000)) throw new Error('Numbers are integers from 1 to 1000000.')
  return { nums }
}

const reverseDigits = n => {
  let rev = 0
  for (let rest = n; rest > 0; rest = Math.floor(rest / 10)) rev = rev * 10 + (rest % 10)
  return rev
}

export function buildTrace(input) {
  const { nums } = input
  const seen = new Set()
  const maps = () => [{ name: 'distinct', keyLabel: 'integer', valueLabel: '', isSet: true, entries: [...seen].map(v => [v]) }]
  const frames = [{ phase: 'start', activeLine: L('seen = empty set'), index: -1, maps: maps(), ops: [], result: 0, message: 'Each number and its reversed digits are both counted. A set keeps only distinct values.' }]
  for (const [i, x] of nums.entries()) {
    const rev = reverseDigits(x)
    for (const v of [x, rev]) {
      const isNew = !seen.has(v)
      seen.add(v)
      frames.push({ phase: 'add', activeLine: v === x ? L('add x to seen') : L('add the reverse of x'), index: i, maps: maps(),
        ops: [isNew ? { map: 'distinct', type: 'insert', key: v } : { map: 'distinct', type: 'lookup', via: 'has', key: v, hit: true, hitNote: 'already counted', missNote: 'new' }],
        result: seen.size, message: `${v === x ? `${x} is added` : `The reverse of ${x} is ${rev}, which is added`}${isNew ? ' as a new integer' : ', but it was already counted'}. Distinct so far: ${seen.size}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return the size'), index: -1, maps: maps(), ops: [], result: seen.size, message: `Distinct integers: ${seen.size}.` })
  return { input, result: seen.size, frames }
}

export const code = `count distinct integers after appending reversals
seen = empty set
for each number x in nums
  add x to seen
  add the reverse of x to seen
return the size of seen`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_distinct_integers(nums):
    seen = set()
    for x in nums:
        seen.add(x)
        seen.add(int(str(x)[::-1]))
    return len(seen)
`
