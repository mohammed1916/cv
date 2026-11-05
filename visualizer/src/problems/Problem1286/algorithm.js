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

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function combinationIterator(characters, combinationLength) {', 'def combination_iterator(characters, combination_length):'],
  ['  const n = characters.length', '    n = len(characters)'],
  ['  const k = combinationLength', '    k = combination_length'],
  ['  const positions = Array.from({ length: k }, (_, i) => i)', '    positions = list(range(k))'],
  ['  const out = []', '    out = []'],
  ['  for (;;) {', '    while True:'],
  ["    out.push(positions.map(p => characters[p]).join(''))", "        out.append(''.join(characters[p] for p in positions))"],
  ['    let i = k - 1', '        i = k - 1'],
  ['    while (i >= 0 && positions[i] === n - k + i) i--', '        while i >= 0 and positions[i] == n - k + i: i -= 1'],
  ['    if (i < 0) break', '        if i < 0: break'],
  ['    positions[i]++', '        positions[i] += 1'],
  ['    for (let j = i + 1; j < k; j++) positions[j] = positions[j - 1] + 1', '        for j in range(i + 1, k): positions[j] = positions[j - 1] + 1'],
  ['  }', ''],
  ['  return out', '    return out'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

// The iterator's next() yields combinations in order while hasNext() is true; this runs that sequence to the end.
export function buildTrace(input) {
  const { characters, combination_length: k } = input
  const n = characters.length
  const positions = Array.from({ length: k }, (_, i) => i)
  const out = []
  const frames = []
  const snap = (phase, activeLine, pythonLine, message, moved = -1) => frames.push({
    phase, activeLine, pythonLine, positions: [...positions], out: [...out], moved, message,
  })

  snap('start', L('const positions'), P('positions = list(range(k))'), 'Start at the first combination, the first k positions.')
  for (;;) {
    out.push(positions.map(p => characters[p]).join(''))
    snap('emit', L('out.push'), P('out.append('), `next() yields ${out[out.length - 1]}.`)
    let i = k - 1
    while (i >= 0 && positions[i] === n - k + i) i--
    snap('advance', L('while (i >= 0'), P('while i >= 0 and positions[i]'), i < 0 ? 'No position can move right.' : `Position ${i} can still move right.`)
    if (i < 0) {
      snap('advance', L('if (i < 0) break'), P('if i < 0:'), 'hasNext() is now false, so the sequence is finished.')
      break
    }
    positions[i]++
    for (let j = i + 1; j < k; j++) positions[j] = positions[j - 1] + 1
    snap('advance', L('positions[i]++'), P('positions[i] += 1'), `Move position ${i} to ${positions[i]}; later positions follow it.`, i)
  }
  snap('done', L('return out'), P('return out'), `${out.length} combinations in order.`)
  return { input, characters, result: out, frames }
}
