export function parseInput(text) {
  const labels = JSON.parse(text)
  if (!Array.isArray(labels) || labels.length < 1 || labels.length > 12) throw new Error('Use a list of 1 to 12 hidden category labels.')
  if (!labels.every(v => Number.isInteger(v) && v >= 0 && v <= 11)) throw new Error('Each hidden label is an integer from 0 to 11.')
  return labels
}

export function buildTrace(labels) {
  // The hidden labels are read only through the same-category query below.
  const sameCategory = (a, b) => labels[a] === labels[b]
  const reps = []
  const assigned = labels.map(() => -1)
  const frames = []
  let queries = 0
  const snap = (over) => ({ element: -1, rep: -1, same: null, reps: reps.slice(), assigned: assigned.slice(), queries, result: null, ...over })

  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('reps = empty'), message: `Scan ${labels.length} elements using only the same-category query.`, ...snap({}) })
  for (let i = 0; i < labels.length; i++) {
    frames.push({ pythonLine: 3, phase: 'pick', activeLine: L('for each element'), message: `Take element ${i} and compare it with the representatives found so far.`, ...snap({ element: i }) })
    let found = false
    for (const rep of reps.slice()) {
      queries++
      const answer = sameCategory(i, rep)
      frames.push({ pythonLine: 6, phase: 'query', activeLine: L('if same category'), message: `Ask whether element ${i} and representative ${rep} share a category: ${answer ? 'yes' : 'no'}.`, ...snap({ element: i, rep, same: answer }) })
      if (answer) {
        found = true
        assigned[i] = reps.indexOf(rep)
        frames.push({ pythonLine: 7, phase: 'match', activeLine: L('if same category'), message: `Element ${i} joins category ${assigned[i] + 1}, represented by ${rep}.`, ...snap({ element: i, rep, same: true }) })
        break
      }
    }
    if (!found) {
      reps.push(i)
      assigned[i] = reps.length - 1
      frames.push({ pythonLine: 10, phase: 'new', activeLine: L('if not found then append'), message: `No representative matches, so element ${i} starts category ${reps.length}.`, ...snap({ element: i }) })
    }
  }
  frames.push({ pythonLine: 11, phase: 'done', activeLine: L('return length of reps'), message: `${reps.length} distinct categor${reps.length === 1 ? 'y' : 'ies'} found.`, ...snap({ result: reps.length }) })
  return { input: labels, result: reps.length, frames }
}

export const code = `count distinct categories with only same-category queries
  reps = empty list of representatives
  for each element i from 0 to n minus 1
    found = false
    for each representative rep in reps
      if same category(i, rep) then found = true and stop searching
    if not found then append i to reps
  return length of reps`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_unique_categories(n, same_category):
    reps = []
    for i in range(n):
        found = False
        for rep in reps:
            if same_category(i, rep):
                found = True
                break
        if not found:
            reps.append(i)
    return len(reps)
`
