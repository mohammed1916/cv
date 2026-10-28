export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || Array.isArray(data) || !Array.isArray(data.nums) || !Number.isInteger(data.diff)) throw new Error('Use {"nums": [...], "diff": d}.')
  const { nums, diff } = data
  if (nums.length < 3 || nums.length > 20) throw new Error('Use 3 to 20 numbers.')
  if (nums.some((v, i) => !Number.isInteger(v) || v < 0 || v > 200 || (i > 0 && v <= nums[i - 1]))) throw new Error('Numbers are integers from 0 to 200, strictly increasing.')
  if (diff < 1 || diff > 20) throw new Error('diff is an integer from 1 to 20.')
  return { nums, diff }
}

export function buildTrace(input) {
  const { nums, diff } = input
  const seen = new Set(nums)
  const frames = [{ phase: 'start', activeLine: L('seen = set'), maps: [{ name: 'seen', keyLabel: 'value', valueLabel: '', isSet: true, entries: nums.map(v => [v]) }], ops: [], result: 0, message: `Every value is in the set. A triplet needs x, x + ${diff}, and x + ${2 * diff}.` }]
  let count = 0
  const setMap = () => [{ name: 'seen', keyLabel: 'value', valueLabel: '', isSet: true, entries: nums.map(v => [v]) }]
  for (const x of nums) {
    const mid = x + diff, top = x + 2 * diff
    const midHit = seen.has(mid)
    const topHit = midHit && seen.has(top)
    if (topHit) count++
    frames.push({ phase: topHit ? 'match' : 'check', activeLine: topHit ? L('add one to count') : L('if x plus diff'), index: nums.indexOf(x), maps: setMap(), result: count,
      ops: [
        { map: 'seen', type: 'lookup', via: 'has', key: mid, hit: midHit, hitNote: `${mid} is in the set`, missNote: `${mid} is not in the set, so no triplet starts at ${x}` },
        ...(midHit ? [{ map: 'seen', type: 'lookup', via: 'has', key: top, hit: seen.has(top), hitNote: `${top} is in the set`, missNote: `${top} is not in the set` }] : []),
      ],
      message: `${x}: ${mid} ${midHit ? 'is' : 'is not'} present${midHit ? `, and ${top} ${seen.has(top) ? 'is' : 'is not'} present` : ''}. ${topHit ? 'Count this triplet.' : 'No triplet here.'}` })
  }
  frames.push({ phase: 'done', activeLine: L('return count'), maps: setMap(), ops: [], result: count, message: `Arithmetic triplets: ${count}.` })
  return { input, result: count, frames }
}

export const code = `count arithmetic triplets with a fixed difference
seen = set of all values in nums
count = 0
for each value x in nums
  if x plus diff is in seen and x plus twice diff is in seen then
    add one to count
return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def arithmetic_triplets(nums, diff):
    seen = set(nums)
    count = 0
    for x in nums:
        if x + diff in seen and x + 2 * diff in seen:
            count += 1
    return count
`
