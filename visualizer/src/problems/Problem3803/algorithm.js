export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || typeof input.s !== 'string') throw new Error('Use an object with a string s.')
  if (!/^[a-z]{1,30}$/.test(input.s)) throw new Error('s has 1 to 30 lowercase letters.')
  return { s: input.s }
}

export function buildTrace({ s }) {
  const frames = []
  const seen = new Set()
  let count = 0
  for (let i = 0; i < s.length; i++) {
    seen.add(s[i])
    const length = i + 1
    const residue = seen.size === length % 3
    if (residue) count++
    frames.push({ pythonLine: P('seen.add'), phase: 'prefix', activeLine: C('grow the prefix'), at: i, distinct: seen.size, length, residue, count,
      message: `Prefix length ${length} has ${seen.size} distinct letters; ${length} mod 3 is ${length % 3}; ${residue ? 'a residue' : 'not a residue'}.` })
  }
  frames.push({ pythonLine: P('return count'), phase: 'done', activeLine: C('return the count'), at: -1, distinct: seen.size, length: s.length, residue: false, count,
    message: `${count} residue prefix${count === 1 ? '' : 'es'} found.` })
  return { input: { s }, result: count, frames }
}

export function solve(s) {
  return buildTrace({ s }).result
}

export const code = `count prefixes whose distinct letter count equals length mod 3
  set count to 0 and an empty set of seen letters
  for each prefix from length 1 upward
    grow the prefix
    add its letter to the set of seen letters
    if the set size equals length mod 3 then add one to count
  return the count`.split('\n').map((text, index) => ({ line: index + 1, text: text.trim() }))

export const python = `def count_residue_prefixes(s):
    seen = set()
    count = 0
    for length, ch in enumerate(s, start=1):
        seen.add(ch)
        if len(seen) == length % 3:
            count += 1
    return count
`

const PY = python.split('\n')
const CODE = code.map(c => c.text)
function P(text) { return PY.findIndex(line => line.includes(text)) + 1 }
function C(text) { return CODE.findIndex(line => line.includes(text)) + 1 }
