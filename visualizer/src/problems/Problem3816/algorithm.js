export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || typeof input.s !== 'string') throw new Error('Use a JSON object with a string s.')
  if (input.s.length < 1 || input.s.length > 10 || !/^[a-z]+$/.test(input.s)) throw new Error('s must be 1 to 10 lowercase letters (visualization cap).')
  return input
}

export function buildTrace(input) {
  const { s } = input
  const all = new Set(s)
  const n = s.length
  // suffix[i] holds the letters that appear at or after index i.
  const suffix = Array.from({ length: n + 1 }, () => new Set())
  for (let i = n - 1; i >= 0; i--) suffix[i] = new Set([...suffix[i + 1], s[i]])
  const included = new Set()
  const picks = []
  let p = 0
  const frames = [{ phase: 'start', activeLine: L('all = the set of letters'), index: -1, picks: [], message: `Every letter in "${s}" must appear at least once in the answer.` }]
  while (included.size < all.size) {
    const letters = [...all].sort()
    for (const c of letters) {
      const j = s.indexOf(c, p)
      if (j < 0) continue
      const covered = new Set([...included, c, ...suffix[j + 1]])
      if (covered.size !== all.size) continue
      picks.push(j)
      included.add(c)
      p = j + 1
      frames.push({ phase: 'pick', activeLine: L('included plus c plus'), index: j, picks: [...picks], message: `Take ${c} from position ${j}: every remaining letter can still be covered.` })
      break
    }
  }
  const result = picks.map(j => s[j]).join('')
  frames.push({ phase: 'done', activeLine: L('return answer'), index: -1, picks: [...picks], message: `Smallest reachable string: "${result}".` })
  return { input, result, frames }
}

export const code = `lexicographically smallest after deleting duplicates (s):
  all = the set of letters in s
  answer = empty string, included = empty set, p = 0
  while included is not all
    for each letter c in increasing order
      j = the first position at or after p holding c
      if j exists and included plus c plus the letters after j cover all then
        append c to answer, add c to included, and set p to j + 1
        stop searching the letters
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def lexicographically_smallest_string_after_deleting_duplicate_characters(s):
    all_letters = set(s)
    n = len(s)
    suffix = [set() for _ in range(n + 1)]
    for i in range(n - 1, -1, -1):
        suffix[i] = suffix[i + 1] | {s[i]}
    answer = []
    included = set()
    p = 0
    while included != all_letters:
        for c in sorted(all_letters):
            j = s.find(c, p)
            if j < 0:
                continue
            if included | {c} | suffix[j + 1] == all_letters:
                answer.append(c)
                included.add(c)
                p = j + 1
                break
    return ''.join(answer)
`
