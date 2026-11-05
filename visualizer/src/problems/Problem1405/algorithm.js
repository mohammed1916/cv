export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with an empty string and the three letter budgets.' },
  { id: 'choose', label: 'Order by budget', description: 'Try letters from the one with the most remaining copies to the one with the fewest.' },
  { id: 'skip', label: 'Block a triple', description: 'A letter that would make three identical characters in a row is skipped.' },
  { id: 'add', label: 'Append a letter', description: 'Append the first allowed letter, then start the next round.' },
  { id: 'done', label: 'Complete', description: 'No letter can be added, so the string is as long as it can be.' },
]

export function parseInput(text) {
  const counts = JSON.parse(text)
  const ok = counts && typeof counts === 'object' && !Array.isArray(counts)
    && ['a', 'b', 'c'].every(k => Number.isInteger(counts[k]) && counts[k] >= 0 && counts[k] <= 20)
    && (counts.a + counts.b + counts.c) > 0
  if (!ok) throw new Error('Use a JSON object with integers a, b and c from 0 to 20, not all zero, such as {"a": 2, "b": 2, "c": 1}.')
  return { a: counts.a, b: counts.b, c: counts.c }
}

export function buildTrace({ a, b, c }) {
  const remaining = { a, b, c }
  let result = ''
  const snap = (extra = {}) => ({ result, remaining: { ...remaining }, ...extra })
  const frames = [{
    phase: 'start', activeLine: L('remaining = {'), pythonLine: PY('remaining = {'), snapshot: snap(),
    message: `Budgets a=${a}, b=${b}, c=${c}. Build the string one letter at a time, never allowing three equal letters in a row.`,
  }]
  for (;;) {
    const order = ['a', 'b', 'c'].sort((x, y) => remaining[y] - remaining[x])
    frames.push({
      phase: 'choose', activeLine: L('const order'), pythonLine: PY('sorted('), snapshot: snap({ order }),
      message: `Try letters in order of remaining copies: ${order.map(l => `${l}×${remaining[l]}`).join(', ')}.`,
    })
    let added = false
    for (const letter of order) {
      if (remaining[letter] === 0) continue
      const blocked = result.length >= 2 && result.endsWith(letter + letter)
      if (blocked) {
        frames.push({
          phase: 'skip', activeLine: L('endsWith(letter'), pythonLine: PY('result[-2:]'), snapshot: snap({ order, candidate: letter }),
          message: `${letter} would make three in a row after "${result.slice(-2)}", so it is skipped.`,
        })
        continue
      }
      result += letter
      remaining[letter] -= 1
      added = true
      frames.push({
        phase: 'add', activeLine: L('result += letter'), pythonLine: PY('result += letter'), snapshot: snap({ order, candidate: letter }),
        message: `Append ${letter}. The string is now "${result}" with ${remaining[letter]} ${letter} left.`,
      })
      break
    }
    if (!added) break
  }
  frames.push({
    phase: 'done', activeLine: L('return result'), pythonLine: PY('return result'), snapshot: snap(),
    message: `No letter can be added. The longest string has length ${result.length}: "${result}".`,
  })
  return { input: { a, b, c }, result, frames }
}

export const code = `function longestDiverseString(a, b, c) {
  const remaining = { a, b, c }
  let result = ''
  while (true) {
    const order = ['a', 'b', 'c'].sort((x, y) => remaining[y] - remaining[x])
    let added = false
    for (const letter of order) {
      if (remaining[letter] === 0) continue
      if (result.endsWith(letter + letter)) continue
      result += letter
      remaining[letter] -= 1
      added = true
      break
    }
    if (!added) return result
  }
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def longest_diverse_string(a, b, c):
    remaining = {'a': a, 'b': b, 'c': c}
    result = ''
    while True:
        moved = False
        for letter in sorted('abc', key=lambda x: -remaining[x]):
            if remaining[letter] == 0:
                continue
            if result[-2:] == letter * 2:
                continue
            result += letter
            remaining[letter] -= 1
            moved = True
            break
        if not moved:
            return result
`
const PY = s => python.split('\n').findIndex(l => l.includes(s)) + 1
