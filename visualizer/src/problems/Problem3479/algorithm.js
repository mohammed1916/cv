import { SegTree } from '../../components/shared/segtreeModel.js'

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Enter an object with fruits and baskets.')
  const { fruits, baskets } = input
  const valid = list => Array.isArray(list) && list.length >= 1 && list.length <= 12 && list.every(v => Number.isInteger(v) && v >= 1 && v <= 10)
  if (!valid(fruits)) throw new Error('fruits has 1 to 12 integers from 1 to 10.')
  if (!valid(baskets)) throw new Error('baskets has 1 to 12 integers from 1 to 10.')
  return { fruits, baskets }
}

export function buildTrace({ fruits, baskets }) {
  const m = baskets.length
  const seg = new SegTree(m, 'max-assign', baskets)
  let unplaced = 0
  const frames = [{ phase: 'start', fruit: null, basket: null, unplaced, seg: { ...seg.snapshot(), title: 'Basket capacities' }, activeLine: L('set unplaced to 0'), message: 'Each basket holds one fruit. Find the leftmost basket with enough capacity.' }]
  for (const f of fruits) {
    let basket = -1
    if (seg.query(0, m - 1) >= f) {
      // Binary search the shortest prefix whose maximum reaches f; its last index is the leftmost fit.
      let lo = 0, hi = m - 1
      while (lo < hi) {
        const mid = (lo + hi) >> 1
        if (seg.query(0, mid) >= f) hi = mid
        else lo = mid + 1
      }
      basket = lo
      seg.update(basket, basket, 0)
    } else {
      unplaced++
    }
    frames.push({ phase: 'fruit', fruit: f, basket: basket < 0 ? null : basket, unplaced, seg: { ...seg.snapshot(), title: `Placing fruit ${f}` }, activeLine: L('find the leftmost basket'), message: basket < 0 ? `Fruit ${f} fits no basket: unplaced.` : `Fruit ${f} goes to basket ${basket}, which is now empty.` })
  }
  frames.push({ phase: 'done', fruit: null, basket: null, unplaced, seg: { ...seg.snapshot(), title: 'Final baskets' }, activeLine: L('return unplaced'), message: `Unplaced fruits: ${unplaced}.` })
  return { input: { fruits, baskets }, result: unplaced, frames }
}

export const code = `count the fruits that no basket can hold
  set unplaced to 0
  for each fruit quantity f in order
    if the largest capacity in the tree is at least f then
      find the leftmost basket whose capacity is at least f, using the tree
      set that basket's capacity to 0
    otherwise add 1 to unplaced
  return unplaced`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def number_of_unplaced_fruits(fruits, baskets):
    caps = list(baskets)
    unplaced = 0
    for f in fruits:
        for i in range(len(caps)):
            if caps[i] >= f:
                caps[i] = 0
                break
        else:
            unplaced += 1
    return unplaced
`
