export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with the keys characters and combination_length.')
  const { characters, combination_length: k } = input
  if (typeof characters !== 'string' || characters.length < 1 || characters.length > 6 || !/^[a-z]+$/.test(characters)) {
    throw new Error('characters is 1 to 6 lowercase letters.')
  }
  if ([...characters].some((c, i, all) => i > 0 && c <= all[i - 1])) throw new Error('characters must be sorted and distinct.')
  if (!Number.isInteger(k) || k < 1 || k > characters.length) throw new Error('combination_length must be from 1 to the number of characters.')
  return { characters, combination_length: k }
}

// The iterator's next() yields combinations in order while hasNext() is true; this runs that sequence to the end.
export function buildTrace(input) {
  const { characters, combination_length: k } = input
  const n = characters.length
  const positions = Array.from({ length: k }, (_, i) => i)
  const out = []
  const frames = []
  const snap = (phase, activeLine, message, moved = -1) => frames.push({
    phase, activeLine, positions: [...positions], out: [...out], moved, message,
  })

  snap('start', L('start with the first combination'), 'Start at the first combination, the first k positions.')
  for (;;) {
    out.push(positions.map(p => characters[p]).join(''))
    snap('emit', L('add the combination'), `next() yields ${out[out.length - 1]}.`)
    let i = k - 1
    while (i >= 0 && positions[i] === n - k + i) i--
    snap('advance', L('find the rightmost position'), i < 0 ? 'No position can move right.' : `Position ${i} can still move right.`)
    if (i < 0) {
      snap('advance', L('if there is none'), 'hasNext() is now false, so the sequence is finished.')
      break
    }
    positions[i]++
    for (let j = i + 1; j < k; j++) positions[j] = positions[j - 1] + 1
    snap('advance', L('move that position'), `Move position ${i} to ${positions[i]}; later positions follow it.`, i)
  }
  snap('done', L('return the output'), `${out.length} combinations in order.`)
  return { input, characters, result: out, frames }
}

export const code = `start with the first combination, the first k positions
set the output to an empty list
repeat
  add the combination at the current positions to the output
  find the rightmost position that can still move right
  if there is none, stop
  move that position right by one and reset the positions after it to follow it
return the output`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def combination_iterator(characters, combination_length):
    n = len(characters)
    k = combination_length
    positions = list(range(k))
    out = []
    while True:
        out.append(''.join(characters[p] for p in positions))
        i = k - 1
        while i >= 0 and positions[i] == n - k + i:
            i -= 1
        if i < 0:
            break
        positions[i] += 1
        for j in range(i + 1, k):
            positions[j] = positions[j - 1] + 1
    return out
`
