export const code = [
  'best starts at minus one, meaning no box yet',
  'for each index i in order',
  'skip the box if its capacity is below itemSize',
  'if best is unset or this capacity is below best capacity then take i',
  'return best',
].map((text, index) => ({ line: index + 1, text }))
const L = key => code.findIndex(c => c.text.includes(key)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with capacity and itemSize.')
  const { capacity, itemSize } = input
  if (!Array.isArray(capacity) || capacity.length < 1 || capacity.length > 12 || !capacity.every(v => Number.isInteger(v) && v >= 0 && v <= 100)) throw new Error('capacity has 1 to 12 integers from 0 to 100.')
  if (!Number.isInteger(itemSize) || itemSize < 0 || itemSize > 100) throw new Error('itemSize is an integer from 0 to 100.')
  return { capacity, itemSize }
}

export function buildTrace({ capacity, itemSize }) {
  let best = -1
  const frames = [{ i: -1, best, phase: 'setup', activeLine: L('best starts'), message: 'No box has been chosen yet.' }]
  capacity.forEach((cap, i) => {
    if (cap < itemSize) {
      frames.push({ i, best, phase: 'skip', activeLine: L('skip the box'), message: `Box ${i} holds ${cap}, too small for ${itemSize}.` })
      return
    }
    if (best === -1 || cap < capacity[best]) {
      best = i
      frames.push({ i, best, phase: 'take', activeLine: L('take i'), message: `Box ${i} (capacity ${cap}) is the tightest fit so far.` })
    } else {
      frames.push({ i, best, phase: 'keep', activeLine: L('take i'), message: `Box ${i} fits, but box ${best} is no larger and comes first.` })
    }
  })
  frames.push({ i: null, best, phase: 'done', activeLine: L('return best'), message: best === -1 ? 'No box can store the item.' : `Answer is box ${best}.` })
  return { input: { capacity, itemSize }, result: best, frames }
}

export const python = `def minimum_capacity_box(capacity, item_size):
    best = -1
    for i, cap in enumerate(capacity):
        if cap < item_size:
            continue
        if best == -1 or cap < capacity[best]:
            best = i
    return best`
