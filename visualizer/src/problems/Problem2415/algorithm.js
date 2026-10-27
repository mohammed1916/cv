import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const input = JSON.parse(text)
  const values = input?.root
  if (!Array.isArray(values) || ![1, 3, 7, 15].includes(values.length)) throw new Error('root must be the level-order array of a perfect binary tree: 1, 3, 7 or 15 entries.')
  if (values.some(v => !Number.isInteger(v) || v < 0 || v > 100)) throw new Error('Values are integers from 0 to 100 (no nulls in a perfect tree).')
  return { root: values }
}

export function buildTrace({ root }) {
  const values = [...root]
  const n = values.length
  const frames = [{ phase: 'start', activeLine: L('set values to the level order'), depth: -1, first: 0, last: -1, values: [...values], message: 'Each odd depth holds one level of a perfect tree. Reverse those levels in place.' }]
  for (let depth = 1; (1 << depth) - 1 < n; depth += 2) {
    const first = (1 << depth) - 1
    const last = Math.min((1 << (depth + 1)) - 2, n - 1)
    let i = first, j = last
    while (i < j) {
      const swap = values[i]
      values[i] = values[j]
      values[j] = swap
      i++
      j--
    }
    frames.push({ phase: 'level', activeLine: L('swap values at first'), depth, first, last, values: [...values], message: `Depth ${depth} is reversed: indexes ${first} to ${last} now hold ${values.slice(first, last + 1).join(', ')}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return values'), depth: -1, first: 0, last: -1, values: [...values], message: `Result in level order: ${values.join(', ')}.` })
  return { input: { root }, root: treeFromLevelOrder(root), result: values, frames }
}

export const code = `reverse odd levels (root)
  set values to the level order of root
  for each odd depth d starting at one
    set first to the first index on depth d
    set last to the last index on depth d
    while first is before last
      swap values at first and last then move both inward
  return values`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def reverse_odd_levels(root):
    values = list(root)
    n = len(values)
    depth = 1
    while (1 << depth) - 1 < n:
        first = (1 << depth) - 1
        last = min((1 << (depth + 1)) - 2, n - 1)
        i = first
        j = last
        while i < j:
            values[i], values[j] = values[j], values[i]
            i += 1
            j -= 1
        depth += 2
    return values
`
