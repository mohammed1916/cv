export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums1, nums2 and queries.')
  const { nums1, nums2, queries } = input
  if (!Array.isArray(nums1) || nums1.length < 1 || nums1.length > 10 || nums1.some(v => v !== 0 && v !== 1)) throw new Error('nums1 is 1 to 10 values, each 0 or 1.')
  if (!Array.isArray(nums2) || nums2.length !== nums1.length || nums2.some(v => !Number.isInteger(v) || v < 0 || v > 5)) throw new Error('nums2 has the same length as nums1, with integers from 0 to 5.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 8) throw new Error('Use 1 to 8 queries.')
  for (const q of queries) {
    if (!Array.isArray(q) || q.length !== 3) throw new Error('Each query is [1, l, r], [2, p, 0] or [3, 0, 0].')
    if (q[0] === 1) {
      if (!(Number.isInteger(q[1]) && Number.isInteger(q[2]) && 0 <= q[1] && q[1] <= q[2] && q[2] < nums1.length)) throw new Error('A flip query [1, l, r] needs 0 <= l <= r < length.')
    } else if (q[0] === 2) {
      if (!Number.isInteger(q[1]) || q[1] < 0 || q[1] > 5 || q[2] !== 0) throw new Error('An add query is [2, p, 0] with p from 0 to 5.')
    } else if (q[0] === 3) {
      if (q[1] !== 0 || q[2] !== 0) throw new Error('A sum query is [3, 0, 0].')
    } else throw new Error('Query types are 1, 2 and 3.')
  }
  return { nums1, nums2, queries }
}

export function buildTrace({ nums1, nums2, queries }) {
  const n = nums1.length
  const cnt = new Array(4 * n).fill(0)
  const lazy = new Array(4 * n).fill(false)
  const bits = [...nums1]
  const build = (node, l, r) => {
    if (l === r) { cnt[node] = nums1[l]; return }
    const m = (l + r) >> 1
    build(2 * node, l, m)
    build(2 * node + 1, m + 1, r)
    cnt[node] = cnt[2 * node] + cnt[2 * node + 1]
  }
  const apply = (node, l, r) => {
    cnt[node] = (r - l + 1) - cnt[node]
    lazy[node] = !lazy[node]
  }
  const push = (node, l, r) => {
    if (!lazy[node]) return
    const m = (l + r) >> 1
    apply(2 * node, l, m)
    apply(2 * node + 1, m + 1, r)
    lazy[node] = false
  }
  const flip = (node, l, r, ql, qr) => {
    if (qr < l || r < ql) return
    if (ql <= l && r <= qr) { apply(node, l, r); return }
    push(node, l, r)
    const m = (l + r) >> 1
    flip(2 * node, l, m, ql, qr)
    flip(2 * node + 1, m + 1, r, ql, qr)
    cnt[node] = cnt[2 * node] + cnt[2 * node + 1]
  }
  build(1, 0, n - 1)
  let sum = nums2.reduce((a, b) => a + b, 0)
  const answers = []
  const frames = [{ phase: 'start', activeLine: L('build a segment tree'), bits: [...bits], ones: cnt[1], sum, answers: [], message: `Build the tree. nums1 has ${cnt[1]} ones and nums2 sums to ${sum}.` }]
  for (const [type, a, b] of queries) {
    let phase, message
    if (type === 1) {
      flip(1, 0, n - 1, a, b)
      for (let i = a; i <= b; i++) bits[i] = 1 - bits[i]
      phase = 'flip'
      message = `Flip nums1 from ${a} to ${b}. The tree now counts ${cnt[1]} ones.`
    } else if (type === 2) {
      sum += a * cnt[1]
      phase = 'add'
      message = `Add ${a} times ${cnt[1]} ones to the sum, giving ${sum}.`
    } else {
      answers.push(sum)
      phase = 'query'
      message = `Answer the sum query with ${sum}.`
    }
    frames.push({ phase, activeLine: L(type === 1 ? 'flip nums1' : type === 2 ? 'add p times' : 'append sum'), bits: [...bits], ones: cnt[1], sum, answers: [...answers], message })
  }
  frames.push({ phase: 'done', activeLine: L('return answers'), bits: [...bits], ones: cnt[1], sum, answers: [...answers], message: `Answers: [${answers.join(', ')}].` })
  return { input: { nums1, nums2, queries }, result: answers, frames }
}

export const code = `answer each query on a 0/1 array nums1 and an integer array nums2
build a segment tree over nums1 that counts ones in each range
keep sum as the total of nums2
for each query q in queries do
  if q is type 1 then
    flip nums1 from index l to r using lazy tags
  else if q is type 2 then
    add p times the number of ones in nums1 to sum
  else
    append sum to the answers
return answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def handle_queries(nums1, nums2, queries):
    n = len(nums1)
    cnt = [0] * (4 * n)
    lazy = [False] * (4 * n)

    def build(node, l, r):
        if l == r:
            cnt[node] = nums1[l]
            return
        m = (l + r) // 2
        build(2 * node, l, m)
        build(2 * node + 1, m + 1, r)
        cnt[node] = cnt[2 * node] + cnt[2 * node + 1]

    def apply(node, l, r):
        cnt[node] = (r - l + 1) - cnt[node]
        lazy[node] = not lazy[node]

    def push(node, l, r):
        if lazy[node]:
            m = (l + r) // 2
            apply(2 * node, l, m)
            apply(2 * node + 1, m + 1, r)
            lazy[node] = False

    def flip(node, l, r, ql, qr):
        if qr < l or r < ql:
            return
        if ql <= l and r <= qr:
            apply(node, l, r)
            return
        push(node, l, r)
        m = (l + r) // 2
        flip(2 * node, l, m, ql, qr)
        flip(2 * node + 1, m + 1, r, ql, qr)
        cnt[node] = cnt[2 * node] + cnt[2 * node + 1]

    build(1, 0, n - 1)
    total = sum(nums2)
    answers = []
    for q in queries:
        if q[0] == 1:
            flip(1, 0, n - 1, q[1], q[2])
        elif q[0] == 2:
            total += q[1] * cnt[1]
        else:
            answers.append(total)
    return answers
`
