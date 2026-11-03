export const phases = [
  { id: 'weigh', label: 'Weigh letters', description: 'Give each letter a weight: its place values in the words, minus its place values in the result. A valid digit assignment makes the weighted sum zero.' },
  { id: 'assign', label: 'Try digits', description: 'Give the next letter an unused digit. A letter that starts a multi-letter word cannot be zero.' },
  { id: 'check', label: 'Check sum', description: 'When every letter has a digit, test whether the weighted sum is zero.' },
  { id: 'done', label: 'Complete', description: 'Report whether some assignment of digits makes the sum true.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.words) || typeof input.result !== 'string') throw new Error('Use an object such as {"words": ["BE", "BE"], "result": "ME"}.')
  const { words, result } = input
  if (words.length < 1 || words.length > 4 || !words.every(w => typeof w === 'string' && /^[A-Z]{1,4}$/.test(w))) throw new Error('words is a list of 1 to 4 uppercase words of up to 4 letters.')
  if (!/^[A-Z]{1,5}$/.test(result)) throw new Error('result is an uppercase word of up to 5 letters.')
  if (new Set([...words.join(''), ...result]).size > 5) throw new Error('Use at most 5 different letters, so the search stays small.')
  return { words, result }
}

export function buildTrace({ words, result }) {
  const letters = [...new Set([...words.join(''), ...result])]
  const weight = Object.fromEntries(letters.map(c => [c, 0]))
  for (const w of words) [...w].forEach((c, k) => { weight[c] += 10 ** (w.length - 1 - k) })
  ;[...result].forEach((c, k) => { weight[c] -= 10 ** (result.length - 1 - k) })
  const leading = new Set([...words, result].filter(w => w.length > 1).map(w => w[0]))
  const digit = {}
  const used = new Set()
  const frames = []
  const snap = extra => ({ letters, weight: { ...weight }, digit: { ...digit }, leading: [...leading], ...extra })

  frames.push({ phase: 'weigh', activeLine: L('weight[c] ='), pythonLine: P('weight[c] +='), snapshot: snap({ index: -1, sum: null }),
    message: `Each letter gets a weight from place values: ${letters.map(c => `${c} ${weight[c]}`).join(', ')}. We need the weighted sum to be zero.` })

  let answer = null
  function search(i) {
    if (i === letters.length) {
      const sum = letters.reduce((acc, c) => acc + weight[c] * digit[c], 0)
      if (sum === 0) {
        answer = { ...digit }
        frames.push({ phase: 'check', activeLine: L('return sum'), pythonLine: P('return sum'), snapshot: snap({ index: i, sum }),
          message: `Every letter has a digit and the weighted sum is 0. This assignment works.` })
        return true
      }
      frames.push({ phase: 'check', activeLine: L('return sum'), pythonLine: P('return sum'), snapshot: snap({ index: i, sum }),
        message: `The weighted sum is ${sum}, not 0. This assignment fails, so we backtrack.` })
      return false
    }
    const c = letters[i]
    for (let d = 0; d <= 9; d++) {
      if (used.has(d)) continue
      if (d === 0 && leading.has(c)) {
        frames.push({ phase: 'assign', activeLine: L('skip it'), pythonLine: P('d == 0 and c in leading'), snapshot: snap({ index: i, sum: null }),
          message: `${c} starts a word, so it cannot be 0. Skip that digit.` })
        continue
      }
      digit[c] = d; used.add(d)
      frames.push({ phase: 'assign', activeLine: L('digit[letter] = d'), pythonLine: P('digit[c] = d'), snapshot: snap({ index: i, sum: null }),
        message: `Try ${d} for ${c}. Digits already used cannot repeat.` })
      if (search(i + 1)) return true
      used.delete(d); delete digit[c]
    }
    return false
  }

  const ok = search(0)
  frames.push({ phase: 'done', activeLine: L('search(0)'), pythonLine: P('return search(0, frozenset())'), snapshot: snap({ index: letters.length, sum: null }),
    message: ok ? 'An assignment exists, so the puzzle is solvable.' : 'Every assignment fails, so the puzzle is not solvable.' })
  return { input: { words, result }, result: ok, frames, answer }
}

export const code = `verbal arithmetic(words, result):
  weight[c] = sum over words of 10^place of c, minus 10^place of c in result
  leading = first letter of every word or result longer than one letter
  search(0)
search(i):
  if i = number of letters: return sum weight[c] * digit[c] == 0
  for d from 0 to 9 not already used:
    if d == 0 and letter is leading: skip it
    digit[letter] = d
    if search(i + 1): return true
  return false`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def verbal_arithmetic(words, result):
    weight = defaultdict(int)
    for w in words:
        for k, c in enumerate(w):
            weight[c] += 10 ** (len(w) - 1 - k)
    for k, c in enumerate(result):
        weight[c] -= 10 ** (len(result) - 1 - k)
    leading = {w[0] for w in words + [result] if len(w) > 1}
    letters = list(weight)
    digit = {}
    def search(i, used):
        if i == len(letters):
            return sum(weight[c] * digit[c] for c in letters) == 0
        c = letters[i]
        for d in range(10):
            if d in used or (d == 0 and c in leading):
                continue
            digit[c] = d
            if search(i + 1, used | {d}):
                return True
        return False
    return search(0, frozenset())`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
