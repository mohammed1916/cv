const VALUE_LIMIT = 50

const PSEUDO = [
  'choose k elements with the largest sum for each index',
  'set answer to zeros and best to an empty list',
  'sort the distinct nums1 values ascending',
  'for each value group in that order',
  'total is the sum of best',
  'answer at i is total for each index in the group',
  'add nums2 at i to best for each index in the group',
  'keep only the k largest in best',
  'return answer',
]
export const code = PSEUDO.map((text, index) => ({ line: index + 1, text }))
const PS = key => code.find(entry => entry.text.includes(key))?.line ?? 1

export const python = `def max_sum_choose(nums1, nums2, k):
    answer = [0] * len(nums1)
    best = []
    for value in sorted(set(nums1)):
        group = [i for i in range(len(nums1)) if nums1[i] == value]
        total = sum(best)
        for i in group:
            answer[i] = total
        for i in group:
            best.append(nums2[i])
            best.sort(reverse=True)
            del best[k:]
    return answer
`
const PYTHON_LINES = python.split('\n')
const PY = key => PYTHON_LINES.findIndex(text => text.includes(key)) + 1

const frame = fields => ({ ...fields, activeLine: PS(fields.pseudo), pythonLine: PY(fields.py) })

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums1, nums2 and k.')
  const { nums1, nums2, k } = input
  const valid = list => Array.isArray(list) && list.length >= 1 && list.length <= 12
    && list.every(value => Number.isInteger(value) && value >= 1 && value <= VALUE_LIMIT)
  if (!valid(nums1) || !valid(nums2) || nums1.length !== nums2.length) throw new Error('nums1 and nums2 need equal lengths from 1 to 12, with values from 1 to 50.')
  if (!Number.isInteger(k) || k < 1 || k > nums1.length) throw new Error('k is an integer from 1 to the array length.')
  return { nums1, nums2, k }
}

export function buildTrace({ nums1, nums2, k }) {
  const answer = Array(nums1.length).fill(0)
  const frames = []
  let best = []
  const groups = [...new Set(nums1)].sort((a, b) => a - b)
  frames.push(frame({ phase: 'start', pseudo: 'set answer to zeros', py: 'answer = [0]', at: -1, group: null, best: [], answer: [...answer],
    message: `Visit ${groups.length} distinct nums1 value${groups.length === 1 ? '' : 's'} from smallest up.` }))
  for (const value of groups) {
    const indices = nums1.flatMap((v, i) => (v === value ? [i] : []))
    const total = best.reduce((sum, item) => sum + item, 0)
    frames.push(frame({ phase: 'group', pseudo: 'for each value group', py: 'for value in', at: indices[0], group: value, best: [...best], answer: [...answer],
      message: `Group nums1 = ${value}. The pool holds [${best.join(', ')}], total ${total}.` }))
    for (const i of indices) {
      answer[i] = total
      frames.push(frame({ phase: 'answer', pseudo: 'answer at i is total', py: 'answer[i] = total', at: i, group: value, best: [...best], answer: [...answer],
        message: `answer[${i}] = ${total}: only smaller nums1 values can be chosen.` }))
    }
    for (const i of indices) {
      best = [...best, nums2[i]].sort((a, b) => b - a).slice(0, k)
      frames.push(frame({ phase: 'insert', pseudo: 'add nums2 at i', py: 'best.append', at: i, group: value, best: [...best], answer: [...answer],
        message: `Add nums2[${i}] = ${nums2[i]} and keep the ${k} largest: [${best.join(', ')}].` }))
    }
  }
  frames.push(frame({ phase: 'done', pseudo: 'return answer', py: 'return answer', at: -1, group: null, best: [...best], answer: [...answer],
    message: `Answer: [${answer.join(', ')}].` }))
  return { input: { nums1, nums2, k }, result: answer, frames }
}
