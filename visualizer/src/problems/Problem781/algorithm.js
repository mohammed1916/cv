export function parseInput(text) {
  const answers = JSON.parse(text)
  if (!Array.isArray(answers) || answers.length < 1 || answers.length > 200 || answers.some(x => !Number.isInteger(x) || x < 0 || x > 999)) throw new Error('Enter a JSON array of 1-200 integers between 0 and 999 (visualization cap: 200 answers).')
  return answers
}
export function buildTrace(answers) {
  const counts = new Map()
  for (const a of answers) counts.set(a, (counts.get(a) || 0) + 1)
  const entries = [...counts.entries()]
  const frames = [{ phase: 'start', pythonLine: 4, activeLine: 1, groups: [], total: 0, message: 'A rabbit answering a saw a other rabbits of its colour, so its colour has a+1 rabbits. Rabbits with the same answer can share a colour group of exactly a+1.' }]
  frames.push({ phase: 'count', pythonLine: 5, activeLine: 2, groups: [], total: 0, message: `Tally answers: ${entries.map(([a, c]) => `${a}x${c}`).join(', ')}.` })
  let total = 0
  const groups = []
  for (const [a, c] of entries) {
    const size = a + 1
    const need = Math.ceil(c / size)
    const added = need * size
    total += added
    groups.push({ answer: a, count: c, size, need, added })
    frames.push({ phase: 'group', pythonLine: 9, activeLine: 6, groups: groups.map(g => ({ ...g })), total, message: `${c} rabbit${c > 1 ? 's' : ''} answered ${a}. A colour group holds ${size}, so ${c} rabbits need ceil(${c}/${size}) = ${need} group${need > 1 ? 's' : ''}, i.e. ${added} rabbits (counting silent ones). Total: ${total}.` })
  }
  frames.push({ phase: 'done', pythonLine: 10, activeLine: 9, groups: groups.map(g => ({ ...g })), total, message: `Minimum rabbits in the forest: ${total}.` })
  return { input: [...answers], result: total, entries, frames }
}
export const code = `function numRabbits(answers) {
  const counts = new Map()
  for (const a of answers) counts.set(a, (counts.get(a) || 0) + 1)
  let total = 0
  for (const [a, c] of counts) {
    const size = a + 1
    total += Math.ceil(c / size) * size
  }
  return total
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `from collections import Counter

def num_rabbits(answers):
    res = 0
    cnt = Counter(answers)
    for a, c in cnt.items():
        group = a + 1
        groups = (c + group - 1) // group
        res += groups * group
    return res
`
