export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums) || !Array.isArray(obj.head)) throw new Error('Use an object with nums and head arrays.')
  const { nums, head } = obj
  if (nums.length < 1 || nums.length > 8) throw new Error('nums needs 1 to 8 values.')
  if (head.length < 1 || head.length > 12) throw new Error('head needs 1 to 12 nodes.')
  if ([...nums, ...head].some(v => !Number.isInteger(v) || v < 1 || v > 10)) throw new Error('Values are integers from 1 to 10 in this visualization.')
  return { nums, head }
}

export function buildTrace(input) {
  const { nums, head } = input
  const banned = new Set()
  const frames = []
  for (const v of nums) banned.add(v)
  frames.push({ phase: 'set', activeLine: L('put every value'), i: -1, removed: head.map(() => false), kept: [], message: `Forbidden values: ${[...banned].join(', ')}.` })
  const removed = head.map(() => false)
  const kept = []
  head.forEach((v, i) => {
    if (banned.has(v)) {
      removed[i] = true
      frames.push({ phase: 'skip', activeLine: L('skip the node'), i, removed: [...removed], kept: [...kept], message: `Node ${i} has value ${v}, which is forbidden; delete it.` })
    } else {
      kept.push(v)
      frames.push({ phase: 'keep', activeLine: L('append the node value'), i, removed: [...removed], kept: [...kept], message: `Node ${i} has value ${v}; keep it.` })
    }
  })
  frames.push({ phase: 'done', activeLine: L('return kept'), i: head.length, removed: [...removed], kept: [...kept], message: `Remaining values: ${kept.join(', ') || 'none'}.` })
  return { input, result: kept, frames }
}

export const code = `delete nodes whose value appears in nums
  put every value of nums into a set called banned
  set kept to an empty list
  for each node in head do
    if the node value is in banned then
      skip the node
    otherwise append the node value to kept
  return kept`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def delete_nodes(nums, head):
    banned = set(nums)
    kept = []
    for v in head:
        if v in banned:
            continue
        kept.append(v)
    return kept
`
