export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use a JSON object with "s", "t" and "k".')
  const { s, t, k } = data
  if (typeof s !== 'string' || typeof t !== 'string' || s.length < 1 || s.length > 12) throw new Error('"s" is a string of 1 to 12 characters.')
  if (!/^[a-z]+$/.test(s) || !/^[a-z]+$/.test(t)) throw new Error('"s" and "t" use lowercase letters a to z only.')
  if (s.length !== t.length) throw new Error('"s" and "t" must have the same length.')
  if (!Number.isInteger(k) || k < 1 || k > 6) throw new Error('"k" is an integer from 1 to 6.')
  if (s.length % k !== 0) throw new Error('"k" must divide the length of "s".')
  return { s, t, k }
}

export function buildTrace({ s, t, k }) {
  const size = s.length / k
  const bag = new Map()
  const frames = [{ phase: 'split', activeLine: L('size = length of s'), side: 's', from: -1, to: -1, bag: {}, message: `Split s into ${k} block${k === 1 ? '' : 's'} of length ${size}.` }]
  for (let start = 0; start < s.length; start += size) {
    const block = s.slice(start, start + size)
    bag.set(block, (bag.get(block) ?? 0) + 1)
    frames.push({ phase: 'bag', activeLine: L('add the block to bag'), side: 's', from: start, to: start + size, bag: Object.fromEntries(bag), message: `Put block "${block}" into the bag.` })
  }
  for (let start = 0; start < t.length; start += size) {
    const block = t.slice(start, start + size)
    if (!bag.get(block)) {
      frames.push({ phase: 'missing', activeLine: L('return false'), side: 't', from: start, to: start + size, bag: Object.fromEntries(bag), message: `Block "${block}" of t is not left in the bag, so t cannot be formed.` })
      return { input: { s, t, k }, result: false, frames }
    }
    bag.set(block, bag.get(block) - 1)
    if (bag.get(block) === 0) bag.delete(block)
    frames.push({ phase: 'match', activeLine: L('remove one copy'), side: 't', from: start, to: start + size, bag: Object.fromEntries(bag), message: `Block "${block}" of t takes one copy from the bag.` })
  }
  frames.push({ phase: 'done', activeLine: L('return true'), side: 't', from: -1, to: -1, bag: Object.fromEntries(bag), message: 'The bag is matched exactly, so t can be formed.' })
  return { input: { s, t, k }, result: true, frames }
}

export const code = `can the blocks of s be rearranged into t
  size = length of s divided by k
  bag = empty count map
  for each block of s of length size
    add the block to bag
  for each block of t of length size
    if bag has no copy of this block then
      return false
    remove one copy of the block from bag
  return true`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import Counter

def rearrange_substrings_to_target(s, t, k):
    size = len(s) // k
    bag = Counter(s[i:i + size] for i in range(0, len(s), size))
    for i in range(0, len(t), size):
        block = t[i:i + size]
        if bag[block] == 0:
            return False
        bag[block] -= 1
    return True
`
