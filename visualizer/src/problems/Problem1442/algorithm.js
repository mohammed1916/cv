export const phases = [
  { id: 'prefix', label: 'Prefix XORs', description: 'pre[i] is the XOR of the first i values, so any segment XOR is a difference of two prefixes.' },
  { id: 'scan', label: 'Pick start and end', description: 'Choose the first index a and the last index c of the outer two arrays.' },
  { id: 'pair', label: 'Check segment', description: 'If pre[a] equals pre[c + 1], the segment a..c XORs to zero.' },
  { id: 'count', label: 'Count middles', description: 'Every middle split b with a < b ≤ c works, so add c - a.' },
  { id: 'answer', label: 'Answer', description: 'Every valid triple has been counted.' },
]

const PYTHON = `def count_triplets(arr):
    n = len(arr)
    pre = [0] * (n + 1)
    for idx, x in enumerate(arr):
        pre[idx + 1] = pre[idx] ^ x
    total = 0
    for a in range(n):
        for c in range(a + 1, n):
            if pre[a] == pre[c + 1]:
                total += c - a
    return total`

export const python = PYTHON
export const code = PYTHON.split('\n').map((text, index) => ({ line: index + 1, text }))
export const pythonLineMap = Object.fromEntries(code.map(({ line }) => [line, line]))
const lineAt = marker => code.find(({ text }) => text.includes(marker)).line

export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 30) throw new Error('Enter a JSON array of 1–30 integers.')
  if (!arr.every(x => Number.isInteger(x) && x >= 0 && x <= 255)) throw new Error('Every value must be an integer from 0 to 255.')
  return arr
}

/** Prefix XORs turn each candidate segment into a single comparison; each matching pair adds its middle choices. */
export function buildTrace(arr) {
  const n = arr.length
  const frames = []
  const pre = [0]
  let total = 0
  const snap = (a = null, c = null, match = null) => ({ arr, pre: [...pre], a, c, match, total })

  frames.push({ phase: 'prefix', activeLine: lineAt('pre = [0]'), message: 'pre[0] = 0: the XOR of an empty prefix.', snapshot: snap() })
  arr.forEach((x, idx) => {
    pre.push(pre[idx] ^ x)
    frames.push({
      phase: 'prefix', activeLine: lineAt('pre[idx + 1] = '),
      message: `pre[${idx + 1}] = ${pre[idx]} XOR ${x} = ${pre[idx + 1]}.`,
      snapshot: snap(),
    })
  })
  for (let a = 0; a < n; a++) {
    frames.push({ phase: 'scan', activeLine: lineAt('for a in range'), message: `Start the first array at index ${a}.`, snapshot: snap(a) })
    for (let c = a + 1; c < n; c++) {
      const match = pre[a] === pre[c + 1]
      frames.push({
        phase: 'pair', activeLine: lineAt('if pre[a] == pre[c + 1]'), 
        message: `Segment ${a}..${c} XORs to ${match ? '0' : 'a non-zero value'}: pre[${a}] = ${pre[a]} and pre[${c + 1}] = ${pre[c + 1]} ${match ? 'match' : 'differ'}.`,
        snapshot: snap(a, c, match),
      })
      if (match) {
        total += c - a
        frames.push({
          phase: 'count', activeLine: lineAt('total += c - a'),
          message: `The middle split can be any of ${c - a} positions between ${a} and ${c}. Total is now ${total}.`,
          snapshot: snap(a, c, true),
        })
      }
    }
  }
  frames.push({ phase: 'answer', activeLine: lineAt('return total'), message: `Total number of triples: ${total}.`, snapshot: snap() })
  return { input: arr, result: total, frames }
}
