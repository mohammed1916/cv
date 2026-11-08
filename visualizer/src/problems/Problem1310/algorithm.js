export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with the empty prefix, whose XOR is 0.' },
  { id: 'prefix', label: 'Build prefix', description: 'Each prefix XOR is the previous prefix XOR combined with the next value.' },
  { id: 'query', label: 'Read query', description: 'A query asks for the XOR from index l through index r.' },
  { id: 'answer', label: 'Answer query', description: 'XOR of the range equals prefix[r + 1] XOR prefix[l], because the shared part cancels.' },
  { id: 'done', label: 'Complete', description: 'Every query has an answer.' },
]

export const examples = [
  { label: 'Small array', input: '{"arr":[1,3,4,8],"queries":[[0,1],[1,2],[0,3],[3,3]]}' },
  { label: 'Single element queries', input: '{"arr":[4,8,2,10],"queries":[[2,3],[1,3],[0,0],[0,3]]}' },
    { label: "Single element", input: "{\"arr\":[7],\"queries\":[[0,0]]}" },
    { label: "Equal values", input: "{\"arr\":[4,4,4,4],\"queries\":[[0,3],[1,2]]}" },
    { label: "Extreme values", input: "{\"arr\":[1000,1,1000],\"queries\":[[0,2],[0,0],[1,1]]}" },
    { label: "Long run: 40 values, 20 queries", input: "{\"arr\":[543,524,599,336,92,791,117,434,983,265,223,737,266,486,128,402,263,784,735,580,702,432,828,533,689,662,149,129,27,204,779,946,71,546,556,195,303,140,91,765],\"queries\":[[3,31],[14,29],[24,31],[3,21],[9,15],[12,23],[13,25],[9,29],[26,36],[30,35],[25,36],[35,37],[16,19],[33,34],[30,39],[30,39],[5,12],[25,34],[35,35],[9,35]]}" },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.arr) || !Array.isArray(data.queries)) throw new Error('Use an object with arr and queries, such as {"arr":[1,3],"queries":[[0,1]]}.')
  if (data.arr.length < 1 || data.arr.length > 40) throw new Error('arr must have 1 to 40 values in this visualization.')
  if (!data.arr.every(v => Number.isInteger(v) && v >= 1 && v <= 1000)) throw new Error('arr values must be integers from 1 to 1000.')
  if (data.queries.length < 1 || data.queries.length > 20) throw new Error('Use 1 to 20 queries in this visualization.')
  for (const q of data.queries) {
    if (!Array.isArray(q) || q.length !== 2 || !q.every(Number.isInteger) || q[0] < 0 || q[1] >= data.arr.length || q[0] > q[1]) {
      throw new Error(`Query ${JSON.stringify(q)} must be [l, r] with 0 <= l <= r < arr.length.`)
    }
  }
  return { arr: data.arr, queries: data.queries }
}

export function buildTrace({ arr, queries }) {
  const pre = [0]
  const answer = []
  const snap = (extra = {}) => ({ arr, pre: [...pre], answer: [...answer], ...extra })
  const frames = [{ phase: 'start', activeLine: L('const pre = [0]'), pythonLine: P('pre = [0]'), snapshot: snap(),
    message: 'The empty prefix before index 0 has XOR 0.' }]
  for (const v of arr) {
    pre.push(pre[pre.length - 1] ^ v)
    frames.push({ phase: 'prefix', activeLine: L('pre.push('), pythonLine: P('pre.append'), snapshot: snap({ built: pre.length - 1 }),
      message: `Add ${v} to the running XOR: prefix ${pre.length - 1} is now ${pre[pre.length - 1]}.` })
  }
  for (const [l, r] of queries) {
    frames.push({ phase: 'query', activeLine: L('for (const [l, r] of queries)'), pythonLine: P('for l, r in queries'), snapshot: snap({ l, r }),
      message: `Query [${l}, ${r}] asks for the XOR of arr[${l}] through arr[${r}].` })
    const value = pre[r + 1] ^ pre[l]
    answer.push(value)
    frames.push({ phase: 'answer', activeLine: L('answer.push('), pythonLine: P('answer.append'), snapshot: snap({ l, r, value }),
      message: `prefix[${r + 1}] XOR prefix[${l}] = ${pre[r + 1]} XOR ${pre[l]} = ${value}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return answer'), pythonLine: P('return answer'), snapshot: snap(),
    message: `Return ${JSON.stringify(answer)}.`, result: answer })
  return { input: { arr, queries }, result: answer, frames }
}

export const code = `function xorQueries(arr, queries) {
  const pre = [0]
  for (const v of arr) pre.push(pre[pre.length - 1] ^ v)
  const answer = []
  for (const [l, r] of queries) {
    answer.push(pre[r + 1] ^ pre[l])
  }
  return answer
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def xor_queries(arr, queries):
    pre = [0]
    for v in arr:
        pre.append(pre[-1] ^ v)
    answer = []
    for l, r in queries:
        answer.append(pre[r + 1] ^ pre[l])
    return answer
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
