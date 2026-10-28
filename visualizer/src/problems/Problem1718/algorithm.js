export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Number.isInteger(input.n)) throw new Error('Use an object with an integer "n".')
  const { n } = input
  if (n < 1 || n > 10) throw new Error('n is an integer from 1 to 10.')
  return { n }
}

export function buildTrace(input) {
  const { n } = input
  const size = 2 * n - 1
  const seq = new Array(size).fill(0)
  const used = new Array(n + 1).fill(false)
  const frames = [{ phase: 'start', activeLine: L('set every slot to empty'), index: 0, value: 0, seq: [...seq], message: `Fill ${size} slots from left to right, trying the largest value first.` }]
  const place = index => {
    if (index === size) return true
    if (seq[index] !== 0) return place(index + 1)
    for (let k = n; k >= 1; k--) {
      if (used[k]) continue
      const second = k === 1 ? index : index + k
      if (second >= size || seq[second] !== 0) continue
      seq[index] = k
      seq[second] = k
      used[k] = true
      frames.push({ phase: 'place', activeLine: L('put the value in both slots'), index, value: k, seq: [...seq], message: `Place ${k} at ${index}${k === 1 ? '' : ` and ${second}`}.` })
      if (place(index + 1)) return true
      seq[index] = 0
      seq[second] = 0
      used[k] = false
      frames.push({ phase: 'undo', activeLine: L('clear both slots'), index, value: k, seq: [...seq], message: `No completion with ${k} at ${index}, so clear it and try a smaller value.` })
    }
    return false
  }
  place(0)
  frames.push({ phase: 'done', activeLine: L('return the sequence'), index: size, value: 0, seq: [...seq], message: `Sequence: [${seq.join(', ')}].` })
  return { input, result: seq, frames }
}

export const code = `lexicographically largest valid sequence for n
  set every slot to empty
  call place on slot zero
  return the sequence
place from a slot index
  if the index is past the last slot then succeed
  if the slot is already filled then place from the next slot
  for each value k from n down to one that is not used yet
    the second slot is the same slot for one, or k slots later otherwise
    if the second slot is in range and empty then
      put the value in both slots and mark k as used
      if place from the next slot succeeds then succeed
      clear both slots and unmark k
  fail`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def largest_valid_sequence(n):
    size = 2 * n - 1
    seq = [0] * size
    used = [False] * (n + 1)

    def place(index):
        if index == size:
            return True
        if seq[index] != 0:
            return place(index + 1)
        for k in range(n, 0, -1):
            if used[k]:
                continue
            second = index if k == 1 else index + k
            if second >= size or seq[second] != 0:
                continue
            seq[index] = k
            seq[second] = k
            used[k] = True
            if place(index + 1):
                return True
            seq[index] = 0
            seq[second] = 0
            used[k] = False
        return False

    place(0)
    return seq
`
