export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.head)) throw new Error('Use an object with a head array of values.')
  const { head } = obj
  if (head.length < 1 || head.length > 12) throw new Error('head needs 1 to 12 nodes.')
  if (head.some(v => !Number.isInteger(v) || v < -5 || v > 5)) throw new Error('Node values are integers from -5 to 5 in this visualization.')
  return { head }
}

export function buildTrace(input) {
  const head = input.head
  const n = head.length
  const prefix = [0]
  for (const v of head) prefix.push(prefix[prefix.length - 1] + v)
  const last = new Map()
  prefix.forEach((s, k) => last.set(s, k))
  const removed = new Array(n).fill(false)
  const kept = []
  const frames = [{ phase: 'prefix', activeLine: L('build the running sums'), k: 0, removed: [...removed], kept: [], message: `Running sums: ${prefix.join(', ')}.` }]
  let k = 0
  while (k < n) {
    const target = last.get(prefix[k])
    if (target > k) {
      for (let t = k; t < target; t++) removed[t] = true
      frames.push({ phase: 'skip', activeLine: L('jump k to last'), k: target, removed: [...removed], kept: [...kept], message: `The sum of nodes ${k} to ${target - 1} is zero, so cut them out.` })
      k = target
    }
    if (k < n) {
      kept.push(head[k])
      frames.push({ phase: 'keep', activeLine: L('keep the node'), k, removed: [...removed], kept: [...kept], message: `Node ${k} (value ${head[k]}) stays in the list.` })
      k++
    }
  }
  frames.push({ phase: 'done', activeLine: L('return kept'), k: n, removed: [...removed], kept: [...kept], message: `Remaining values: ${kept.join(', ') || 'none'}.` })
  return { input, result: kept, frames }
}

export const code = `remove zero-sum runs from a linked list
  build the running sums, where sum[k] is the total of the first k nodes
  set last[s] to the largest index k with sum[k] equal to s
  set k to 0 and kept to an empty list
  while k is less than the number of nodes do
    jump k to last[sum[k]], which cuts out a zero-sum run
    if k is less than the number of nodes then
      keep the node at k and move k forward by one
  return kept`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def remove_zero_sum(head):
    n = len(head)
    prefix = [0] * (n + 1)
    for i, v in enumerate(head):
        prefix[i + 1] = prefix[i] + v
    last = {}
    for k, s in enumerate(prefix):
        last[s] = k
    kept = []
    k = 0
    while k < n:
        k = last[prefix[k]]
        if k < n:
            kept.append(head[k])
            k += 1
    return kept
`
