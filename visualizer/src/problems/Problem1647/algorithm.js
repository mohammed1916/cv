export const phases = [
  { id: 'start', label: 'Count letters', description: 'Count each letter and sort the frequencies from largest to smallest.' },
  { id: 'inspect', label: 'Try frequency', description: 'Start with the current frequency and check whether a kept letter already uses it.' },
  { id: 'update', label: 'Lower or keep', description: 'Each collision deletes one character; a free positive value is kept.' },
  { id: 'done', label: 'Deletions', description: 'Return the total number of deleted characters.' },
]

export const code = [
  "function minDeletions(s) {",
  "  const counts = new Map();",
  "  for (const ch of s) counts.set(ch, (counts.get(ch) || 0) + 1);",
  "  const freqs = [...counts.values()].sort((a, b) => b - a);",
  "  const kept = new Set();",
  "  let deletions = 0;",
  "  for (const count of freqs) {",
  "    let target = count;",
  "    while (target > 0 && kept.has(target)) {",
  "      target--;",
  "      deletions++;",
  "    }",
  "    if (target > 0) kept.add(target);",
  "  }",
  "  return deletions;",
  "}",
].map((text, index) => ({ line: index + 1, text }))

export const python = `from collections import Counter

def min_deletions(s):
    freqs = sorted(Counter(s).values(), reverse=True)
    kept = set()
    deletions = 0
    for count in freqs:
        target = count
        while target > 0 and target in kept:
            target -= 1
            deletions += 1
        if target > 0:
            kept.add(target)
    return deletions
`

const pc = needle => code.findIndex(line => line.text.includes(needle)) + 1
const py = needle => python.split('\n').findIndex(line => line.includes(needle)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"s": "aabbcc"}.')
  const { s } = input
  if (typeof s !== 'string' || !/^[a-z]{1,60}$/.test(s)) throw new Error('s is 1 to 60 lowercase letters a to z.')
  return { s }
}

export function buildTrace({ s }) {
  const counts = new Map()
  for (const ch of s) counts.set(ch, (counts.get(ch) || 0) + 1)
  const freqs = [...counts.values()].sort((a, b) => b - a)
  const kept = new Set()
  let deletions = 0
  const frames = []
  const snap = (index, count, target) => ({ freqs: [...freqs], index, count, target, kept: [...kept].sort((a, b) => b - a), deletions })
  const push = (phase, pcNeedle, pyNeedle, message, snapshot) =>
    frames.push({ phase, activeLine: pc(pcNeedle), pythonLine: py(pyNeedle), message, snapshot })

  push('start', 'counts.set(ch', 'freqs = sorted', `Frequencies are ${freqs.join(', ')}, sorted from largest to smallest.`, snap(null, null, null))
  freqs.forEach((count, index) => {
    let target = count
    push('inspect', 'let target = count', 'target = count', `Frequency ${count}: try to keep it as ${count}.`, snap(index, count, target))
    while (target > 0 && kept.has(target)) {
      target -= 1
      deletions += 1
      push('update', 'target--', 'target -= 1',
        target > 0
          ? `That value is already kept, so lower it to ${target} and delete one character.`
          : 'Every positive value up to here is taken; this letter disappears after one more deletion.',
        snap(index, count, target))
    }
    if (target > 0) kept.add(target)
    push('update', 'if (target > 0)', 'if target > 0',
      target > 0 ? `Keep ${target} for this letter.` : 'This letter is removed completely, so its zero value can repeat.',
      snap(index, count, target))
  })
  push('done', 'return deletions', 'return deletions', `Total deletions: ${deletions}.`, snap(null, null, null))
  return { input: { s }, result: deletions, frames }
}
