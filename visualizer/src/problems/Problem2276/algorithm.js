import { SegTree } from '../../components/shared/segtreeModel.js'

const SPAN = 32

export function parseInput(text) {
  const ops = JSON.parse(text)
  if (!Array.isArray(ops) || ops.length < 1 || ops.length > 12) throw new Error('Enter 1 to 12 operations: ["add", l, r] or ["count"].')
  for (const op of ops) {
    if (!Array.isArray(op)) throw new Error('Each operation is an array.')
    if (op[0] === 'count' && op.length === 1) continue
    if (op[0] === 'add' && op.length === 3 && Number.isInteger(op[1]) && Number.isInteger(op[2]) && op[1] >= 1 && op[1] <= op[2] && op[2] <= SPAN) continue
    throw new Error(`Use ["add", l, r] with 1 <= l <= r <= ${SPAN}, or ["count"].`)
  }
  return ops
}

export function buildTrace(ops) {
  // Leaf k stands for the integer k + 1; covering a range sets its count to the number of leaves.
  const seg = new SegTree(SPAN, 'cover-assign')
  const results = []
  const frames = [{ phase: 'start', op: null, count: 0, seg: { ...seg.snapshot(), title: 'Covered integers 1 to 32' }, activeLine: L('set the covered tree'), message: 'No integers are covered yet.' }]
  ops.forEach((op, i) => {
    if (op[0] === 'add') {
      seg.update(op[1] - 1, op[2] - 1, 1)
      frames.push({ phase: 'add', op: i, count: seg.value[1], seg: { ...seg.snapshot(), title: `After adding [${op[1]}, ${op[2]}]` }, activeLine: L('mark leaves'), message: `Covered integers now: ${seg.value[1]}.` })
    } else {
      results.push(seg.value[1])
      frames.push({ phase: 'count', op: i, count: seg.value[1], seg: { ...seg.snapshot(), title: 'Count query' }, activeLine: L('record the number'), message: `count returns ${seg.value[1]}.` })
    }
  })
  frames.push({ phase: 'done', op: null, count: null, seg: { ...seg.snapshot(), title: 'Final tree' }, activeLine: L('return the recorded'), message: `Recorded counts: [${results.join(', ')}].` })
  return { input: ops, result: results, frames }
}

export const code = `count the covered integers after each add and count operation
  set the covered tree to all uncovered over 1 to 32
  for each operation in order
    if the operation adds [l, r] then
      mark leaves l to r as covered, lazily, in the segment tree
    otherwise record the number of covered integers at the root
  return the recorded counts`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_integers_in_intervals(operations):
    covered = set()
    out = []
    for op in operations:
        if op[0] == 'add':
            covered.update(range(op[1], op[2] + 1))
        else:
            out.append(len(covered))
    return out
`
