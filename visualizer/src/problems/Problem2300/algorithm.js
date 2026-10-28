export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.spells) || !Array.isArray(input.potions)) throw new Error('Use an object with "spells", "potions" and "success".')
  const { spells, potions, success } = input
  if (spells.length < 1 || spells.length > 12 || potions.length < 1 || potions.length > 12) throw new Error('spells and potions each hold 1 to 12 integers.')
  if ([...spells, ...potions].some(v => !Number.isInteger(v) || v < 1 || v > 20)) throw new Error('Strengths are integers from 1 to 20.')
  if (!Number.isInteger(success) || success < 1 || success > 100) throw new Error('success is an integer from 1 to 100.')
  return { spells, potions, success }
}

export function buildTrace(input) {
  const { spells, potions, success } = input
  const ordered = [...potions].sort((a, b) => a - b)
  const frames = [{ phase: 'sort', activeLine: L('sort a copy of the potions'), spell: -1, need: null, lo: 0, hi: ordered.length, mid: -1, count: null, sorted: ordered, message: 'Sort a copy of the potions so each spell can use binary search.' }]
  const answer = []
  spells.forEach((spell, index) => {
    const need = Math.floor((success + spell - 1) / spell)
    let lo = 0
    let hi = ordered.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      frames.push({ phase: 'search', activeLine: L('binary search the sorted potions'), spell: index, need, lo, hi, mid, count: null, sorted: ordered, message: `Spell ${spell} needs a potion of at least ${need}. Compare with potion ${ordered[mid]}.` })
      if (ordered[mid] >= need) hi = mid
      else lo = mid + 1
    }
    const count = ordered.length - lo
    answer.push(count)
    frames.push({ phase: 'count', activeLine: L('add the number of potions'), spell: index, need, lo, hi: ordered.length, mid: -1, count, sorted: ordered, message: `Spell ${spell} succeeds with ${count} potion(s).` })
  })
  frames.push({ phase: 'done', activeLine: L('return the counts'), spell: -1, need: null, lo: 0, hi: 0, mid: -1, count: null, sorted: ordered, message: `Counts: [${answer.join(', ')}].` })
  return { input, result: answer, frames }
}

export const code = `count the potions that make each spell successful
  sort a copy of the potions in increasing order
  for each spell in order
    find the smallest potion strength that gives at least success
    binary search the sorted potions for the first one at least that strong
    add the number of potions from that position to the end
  return the counts`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def successful_pairs(spells, potions, success):
    ordered = sorted(potions)
    total = len(ordered)
    answer = []
    for spell in spells:
        need = (success + spell - 1) // spell
        lo, hi = 0, total
        while lo < hi:
            mid = (lo + hi) // 2
            if ordered[mid] >= need:
                hi = mid
            else:
                lo = mid + 1
        answer.append(total - lo)
    return answer
`
