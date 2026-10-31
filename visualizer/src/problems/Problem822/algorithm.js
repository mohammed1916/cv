export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Array.isArray(data.fronts) || !Array.isArray(data.backs) || data.fronts.length !== data.backs.length) throw new Error('Enter JSON like {"fronts": [1,2], "backs": [2,1]} with equal-length arrays.')
  if (!data.fronts.length || data.fronts.length > 50) throw new Error('Use 1-50 cards (visualization cap).')
  if ([...data.fronts, ...data.backs].some(v => !Number.isInteger(v) || v < 1 || v > 2000)) throw new Error('Every face must be an integer from 1 to 2000.')
  return { fronts: [...data.fronts], backs: [...data.backs] }
}
export function buildTrace({ fronts, backs }) {
  const n = fronts.length
  const bad = new Set()
  const frames = [{ phase: 'start', index: -1, bad: [], best: 0, activeLine: L('set bad to an empty set'), message: 'A number is unusable if some card shows it on both sides: it can never leave the front.', pythonLine: 2 }]
  for (let i = 0; i < n; i++) {
    const same = fronts[i] === backs[i]
    if (same) bad.add(fronts[i])
    frames.push({ phase: 'poison', index: i, bad: [...bad].sort((a, b) => a - b), best: 0, activeLine: L('if fronts[i] equals backs[i]'),
      message: same ? `Card ${i} shows ${fronts[i]} on both sides, so ${fronts[i]} is always face-up: mark it bad.` : `Card ${i} has ${fronts[i]} and ${backs[i]}: different faces, nothing is poisoned.`, pythonLine: 2 })
  }
  const all = [...fronts, ...backs]
  let best = 0
  all.forEach((x, k) => {
    const ok = !bad.has(x)
    const improves = ok && (best === 0 || x < best)
    if (improves) best = x
    frames.push({ phase: 'candidate', index: k, bad: [...bad].sort((a, b) => a - b), best, activeLine: improves ? L('set best to x') : L('x is not in bad'),
      message: !ok ? `${x} is bad: some card has it on both sides.` : improves ? `${x} is not bad and beats the previous best: best = ${x}.` : `${x} is allowed but not smaller than ${best}.`, pythonLine: improves ? 6 : 5 })
  })
  frames.push({ phase: 'done', index: all.length - 1, bad: [...bad].sort((a, b) => a - b), best, activeLine: L('return best'), message: best ? `Smallest good number: ${best}.` : 'Every face is bad, so the answer is 0.', pythonLine: 7 })
  return { input: { fronts, backs }, all, result: best, frames }
}
export const code = `set bad to an empty set
for each card i with front fronts[i] and back backs[i]
  if fronts[i] equals backs[i], add fronts[i] to bad
set best to 0
for each face x in fronts, then backs
  if x is not in bad and (best is 0 or x is less than best), set best to x
return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def flip_game(fronts, backs):
    bad = {f for f, b in zip(fronts, backs) if f == b}
    best = 0
    for x in fronts + backs:
        if x not in bad and (best == 0 or x < best):
            best = x
    return best
`
