export const phases = [
  { id: 'start', label: 'Sets', description: 'Turn each array into the set of its distinct values.' },
  { id: 'count', label: 'Count arrays', description: 'For each value, count how many of the three sets contain it.' },
  { id: 'done', label: 'Result', description: 'Keep the values present in at least two sets.' },
]

export const code = `function twoOutOfThree(nums1, nums2, nums3) {
  const sets = [new Set(nums1), new Set(nums2), new Set(nums3)]
  const answer = []
  const seen = new Set()
  for (const value of [...nums1, ...nums2, ...nums3]) {
    if (seen.has(value)) continue
    seen.add(value)
    const appearances = sets.filter(set => set.has(value)).length
    if (appearances >= 2) answer.push(value)
  }
  return answer
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def two_out_of_three(nums1, nums2, nums3):
    sets = [set(nums1), set(nums2), set(nums3)]
    answer = []
    seen = set()
    for value in nums1 + nums2 + nums3:
        if value in seen:
            continue
        seen.add(value)
        appearances = sum(1 for s in sets if value in s)
        if appearances >= 2:
            answer.append(value)
    return answer
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let obj
  try { obj = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"nums1":[1,1,3],"nums2":[2,3],"nums3":[3]}.') }
  const { nums1, nums2, nums3 } = obj || {}
  for (const arr of [nums1, nums2, nums3]) {
    if (!Array.isArray(arr) || arr.length < 1 || arr.length > 20 || !arr.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) {
      throw new Error('Each array must have 1 to 20 whole numbers from 1 to 100.')
    }
  }
  return { nums1, nums2, nums3 }
}

export function buildTrace({ nums1, nums2, nums3 }) {
  const frames = []
  const sets = [new Set(nums1), new Set(nums2), new Set(nums3)]
  const answer = []
  const seen = new Set()
  const add = (phase, c, p, message, value, counts) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { arrays: [nums1, nums2, nums3], value, counts, answer: answer.slice() },
  })
  add('start', 'const sets = [new Set', 'sets = [set(', 'Three sets are built from the three arrays.', null, null)
  for (const value of [...nums1, ...nums2, ...nums3]) {
    if (seen.has(value)) continue
    seen.add(value)
    const counts = sets.map(set => set.has(value))
    const appearances = counts.filter(Boolean).length
    if (appearances >= 2) answer.push(value)
    add('count', 'const appearances', 'appearances = sum', `${value} appears in ${appearances} array(s)${appearances >= 2 ? ', so it is kept' : ''}.`, value, counts)
  }
  add('done', 'return answer', 'return answer', `Values in at least two arrays: ${answer.join(', ') || 'none'}.`, null, null)
  return { input: { nums1, nums2, nums3 }, result: answer, frames }
}
