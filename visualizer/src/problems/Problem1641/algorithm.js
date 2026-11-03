export const phases = [
  { id: 'start', label: 'Length 1', description: 'A string of length one is a single vowel, so each of the five endings has one string.' },
  { id: 'extend', label: 'Extend by one', description: 'A sorted string ending in vowel c can be extended by any vowel at most c. So each new count is a running sum of the old counts.' },
  { id: 'sum', label: 'Sum endings', description: 'Every sorted string of the target length ends in exactly one vowel, so the counts add up to the answer.' },
  { id: 'done', label: 'Total', description: 'Return the total number of sorted vowel strings.' },
]

export function parseInput(text) {
  const n = JSON.parse(text)
  if (!Number.isInteger(n) || n < 1 || n > 50) throw new Error('Enter an integer length from 1 to 50.')
  return n
}

export function buildTrace(n) {
  const frames = []
  const vowels = ['a', 'e', 'i', 'o', 'u']
  let ends = [1, 1, 1, 1, 1]
  const snap = (length, total) => ({ n, length, ends: [...ends], vowels, total })
  frames.push({
    phase: 'start', activeLine: 2,
    message: 'Length 1: the strings a, e, i, o and u, one ending per vowel.',
    snapshot: snap(1, 5),
  })
  for (let length = 2; length <= n; length++) {
    let running = 0
    for (let c = 0; c < 5; c++) {
      running += ends[c]
      ends[c] = running
    }
    const total = ends.reduce((sum, v) => sum + v, 0)
    frames.push({
      phase: 'extend', activeLine: 7,
      message: `Length ${length}: each ending is the sum of the endings up to it. The strings ending in u, for example, count all of the previous ones.`,
      snapshot: snap(length, total),
    })
  }
  const total = ends.reduce((sum, v) => sum + v, 0)
  frames.push({
    phase: 'sum', activeLine: 8,
    message: `The five endings for length ${n} are ${ends.join(', ')}. Add them to get ${total}.`,
    snapshot: snap(n, total),
  })
  frames.push({
    phase: 'done', activeLine: 8,
    message: `Return ${total}: the number of non-decreasing vowel strings of length ${n}.`,
    snapshot: snap(n, total),
  })
  return { input: n, result: total, frames }
}

const LINES = [
  'def count_sorted_vowel_strings(n):',
  '    ends = [1, 1, 1, 1, 1]              # length 1: a, e, i, o, u',
  '    for length in range(2, n + 1):',
  '        running = 0',
  '        for c in range(5):',
  '            running += ends[c]',
  '            ends[c] = running',
  '    return sum(ends)',
]
export const code = LINES.map((text, index) => ({ line: index + 1, text }))
export const python = LINES.join('\n')
export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8 }
