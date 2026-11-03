export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.bits)) throw new Error('Use an object with a bits list.')
  const bits = input.bits
  if (bits.length < 5 || bits.length > 20) throw new Error('The visualization accepts 5 to 20 bits.')
  if (!bits.every(b => b === 0 || b === 1)) throw new Error('Each bit is 0 or 1.')
  return { bits }
}

// Reader answer: 4 when all four bits agree, 2 for a three-to-one split, 0 for two-to-two.
const answerFor = ones => (ones === 0 || ones === 4 ? 4 : ones === 2 ? 0 : 2)

export const code = `find an index holding the strict majority bit, or -1 on a tie
  base = query(0, 1, 2, 3)
  same[0] = true, meaning bit 0 is the reference class
  for i from 4 to n - 1
    same[i] = query(1, 2, 3, i) equals base
  for i from 1 to 3
    probe = the window 0..3 with i replaced by 4
    same[i] = (query(probe) equals base) equals same[4]
  with = number of indices marked same
  without = n - with
  if with is greater than without return the first index marked same
  if without is greater than with return the first index not marked same
  return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `class ArrayReader:
    """Stand-in reader for the hidden bits; query reports 4, 2 or 0."""
    def __init__(self, bits):
        self._bits = bits
        self.queries = 0

    def length(self):
        return len(self._bits)

    def query(self, a, b, c, d):
        self.queries += 1
        ones = self._bits[a] + self._bits[b] + self._bits[c] + self._bits[d]
        if ones in (0, 4):
            return 4
        return 2 if ones in (1, 3) else 0

def guess_majority(reader):
    n = reader.length()
    base = reader.query(0, 1, 2, 3)
    same = [None] * n
    same[0] = True
    for i in range(4, n):
        same[i] = reader.query(1, 2, 3, i) == base
    for i in range(1, 4):
        probe = [4 if j == i else j for j in (0, 1, 2, 3)]
        same[i] = (reader.query(*probe) == base) == same[4]
    with_first = sum(1 for s in same if s)
    without = n - with_first
    if with_first > without:
        return same.index(True)
    if without > with_first:
        return same.index(False)
    return -1

if __name__ == "__main__":
    reader = ArrayReader([1, 0, 1, 1, 1, 0, 0])
    print(guess_majority(reader), reader.queries)
`
const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export function buildTrace({ bits }) {
  const n = bits.length
  const query = (a, b, c, d) => answerFor([a, b, c, d].reduce((sum, k) => sum + bits[k], 0))
  const same = Array(n).fill(null)
  const frames = []
  let queries = 0
  let tuple = null
  let lastAnswer = null
  let base = null
  const push = (frame) => frames.push({ same: [...same], tuple, lastAnswer, queries, base, answer: null, ...frame })

  push({ pythonLine: P('n = reader.length()'), phase: 'start', activeLine: L('base = query(0, 1, 2, 3)'), message: `Read ${n} hidden bits. Bit 0 is the reference.` })
  tuple = [0, 1, 2, 3]
  base = query(0, 1, 2, 3)
  queries += 1
  lastAnswer = base
  same[0] = true
  push({ pythonLine: P('base = reader.query(0, 1, 2, 3)'), phase: 'base', activeLine: L('base = query(0, 1, 2, 3)'), message: `The first four bits give ${base}; bit 0 is marked as the reference class.` })

  for (let i = 4; i < n; i++) {
    tuple = [1, 2, 3, i]
    lastAnswer = query(1, 2, 3, i)
    queries += 1
    same[i] = lastAnswer === base
    push({ pythonLine: P('same[i] = reader.query(1, 2, 3, i) == base'), phase: 'scan', activeLine: L('same[i] = query(1, 2, 3, i)'), message: same[i] ? `Index ${i} matches the reference bit.` : `Index ${i} differs from the reference bit.` })
  }

  for (let i = 1; i <= 3; i++) {
    tuple = [0, 1, 2, 3].map(k => (k === i ? 4 : k))
    lastAnswer = query(...tuple)
    queries += 1
    const matchesFour = lastAnswer === base
    same[i] = matchesFour === same[4]
    push({ pythonLine: P('probe = [4 if j == i else j'), phase: 'pivot', activeLine: L('probe = the window'), message: `Swap index ${i} for index 4 to place ${i} relative to the reference.` })
  }

  const withRef = same.filter(Boolean).length
  const without = n - withRef
  let answer = -1
  if (withRef > without) answer = same.indexOf(true)
  else if (without > withRef) answer = same.indexOf(false)
  tuple = null
  push({ pythonLine: P('with_first = sum'), phase: 'count', activeLine: L('with = number of indices'), message: `${withRef} indices share the reference bit and ${without} do not.` })
  push({ pythonLine: P('return -1'), phase: 'done', activeLine: L('return -1'), message: answer === -1 ? 'The two classes tie, so there is no strict majority.' : `Index ${answer} holds the strict majority bit.`, answer })
  return { input: { bits }, result: answer, frames, queries }
}
