const BITS = 5

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and queries.')
  const { nums, queries } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 10 || nums.some(v => !Number.isInteger(v) || v < 0 || v > 30)) throw new Error('nums has 1 to 10 integers from 0 to 30.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 6) throw new Error('Use 1 to 6 queries.')
  for (const q of queries) {
    if (!Array.isArray(q) || q.length !== 2 || !Number.isInteger(q[0]) || !Number.isInteger(q[1]) || q[0] < 0 || q[0] > 30 || q[1] < 0 || q[1] > 30) throw new Error('Each query is [x, m] with integers from 0 to 30.')
  }
  return { nums, queries }
}

const newNode = () => ({ child: [null, null], min: Infinity })

export function buildTrace({ nums, queries }) {
  const root = newNode()
  for (const v of nums) {
    let node = root
    node.min = Math.min(node.min, v)
    for (let b = BITS - 1; b >= 0; b--) {
      const bit = (v >> b) & 1
      if (!node.child[bit]) node.child[bit] = newNode()
      node = node.child[bit]
      node.min = Math.min(node.min, v)
    }
  }
  const answers = []
  const frames = [{ phase: 'start', activeLine: L('build a binary trie'), q: -1, x: null, m: null, answer: null, chosen: null, answers: [], message: `Insert ${nums.length} numbers into the trie.` }]
  queries.forEach(([x, m], q) => {
    let answer
    let chosen = null
    let activeLine
    if (root.min > m) {
      answer = -1
      activeLine = L('if the root')
    } else {
      let node = root
      let best = 0
      for (let b = BITS - 1; b >= 0; b--) {
        const want = 1 - ((x >> b) & 1)
        const child = node.child[want]
        if (child && child.min <= m) {
          best |= 1 << b
          node = child
        } else {
          node = node.child[1 - want]
        }
      }
      answer = best
      chosen = x ^ best
      activeLine = L('walk the trie')
    }
    answers.push(answer)
    frames.push({ phase: 'query', activeLine, q, x, m, answer, chosen, answers: [...answers], message: answer === -1 ? `No number is at most ${m}, so the answer is -1.` : `Best partner for ${x} under ${m} is ${chosen}, giving ${answer}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return answers'), q: queries.length, x: null, m: null, answer: null, chosen: null, answers: [...answers], message: `Answers: [${answers.join(', ')}].` })
  return { input: { nums, queries }, result: answers, frames }
}

export const code = `maximum xor of x with an element of nums that is at most m, for each query
build a binary trie of nums where each node stores the smallest value below it
set answers to an empty list
for each query (x, m) in order do
  if the root's smallest value is above m then answer -1
  otherwise walk the trie from the top bit down
    prefer the child whose bit is opposite to x's bit when its smallest value is at most m
    otherwise take the other child
  append the answer to answers
return answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_xor_with_element(nums, queries):
    BITS = 5
    root = [None, None, 10 ** 9]
    for v in nums:
        node = root
        node[2] = min(node[2], v)
        for b in range(BITS - 1, -1, -1):
            bit = (v >> b) & 1
            if node[bit] is None:
                node[bit] = [None, None, 10 ** 9]
            node = node[bit]
            node[2] = min(node[2], v)
    answers = []
    for x, m in queries:
        if root[2] > m:
            answers.append(-1)
            continue
        node = root
        best = 0
        for b in range(BITS - 1, -1, -1):
            want = 1 - ((x >> b) & 1)
            child = node[want]
            if child is not None and child[2] <= m:
                best |= 1 << b
                node = child
            else:
                node = node[1 - want]
        answers.append(best)
    return answers
`
