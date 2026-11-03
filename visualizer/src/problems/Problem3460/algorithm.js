const LOWER = /^[a-z]+$/

export const phases = [
  { id: 'start', label: 'Read', description: 'Read the two strings.' },
  { id: 'prefix', label: 'Prefix', description: 'Measure the common prefix with no removal.' },
  { id: 'remove', label: 'Remove', description: 'Delete one letter from first.' },
  { id: 'slide', label: 'Compare', description: 'Compare the letters after the gap.' },
  { id: 'record', label: 'Record', description: 'Keep the longest candidate.' },
  { id: 'done', label: 'Result', description: 'Return the best length.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with first and second.')
  const { first, second } = input
  if (typeof first !== 'string' || first.length < 1 || first.length > 20 || !LOWER.test(first)) throw new Error('first has 1 to 20 lowercase letters.')
  if (typeof second !== 'string' || second.length < 1 || second.length > 20 || !LOWER.test(second)) throw new Error('second has 1 to 20 lowercase letters.')
  return { first, second }
}

export const code = [
  'longest prefix after at most one removal',
  '  pre = length of the common prefix of first and second',
  '  best = pre',
  '  for each removal index r from 0 to min(pre, len(first) minus 1)',
  '    k = 0',
  '    while the letters after the gap still match second',
  '      k = k + 1',
  '    best = max(best, r + k)',
  '  return best',
].map((text, index) => ({ line: index + 1, text }))

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export function buildTrace({ first, second }) {
  const n = first.length
  const m = second.length
  const frames = []
  let pre = 0
  frames.push({ phase: 'start', activeLine: L('longest prefix'), pythonLine: P('def longest'), first, second, pre: 0, removed: -1, reach: 0, best: 0, match: null, message: `Read first (${n} letters) and second (${m} letters). No letter has been compared yet.` })
  while (pre < n && pre < m && first[pre] === second[pre]) {
    pre++
    frames.push({ phase: 'prefix', activeLine: L('pre = length'), pythonLine: P('while pre < len(first)'), first, second, pre, removed: -1, reach: pre, best: pre, match: true, message: `${first[pre - 1]} equals ${second[pre - 1]}; the shared prefix grows to ${pre}.` })
  }
  const stopped = pre < n && pre < m
  frames.push({ phase: 'prefix', activeLine: L('pre = length'), pythonLine: P('while pre < len(first)'), first, second, pre, removed: -1, reach: pre, best: pre, match: false, message: stopped ? `${first[pre]} differs from ${second[pre]} at index ${pre}, so the prefix stops at ${pre}.` : `One word ends at ${pre}, so the prefix stops there.` })
  let best = pre
  frames.push({ phase: 'record', activeLine: L('best = pre'), pythonLine: P('best = pre'), first, second, pre, removed: -1, reach: pre, best, match: null, message: `With no removal the best length is ${pre}.` })
  const last = Math.min(pre, n - 1)
  for (let r = 0; r <= last; r++) {
    frames.push({ phase: 'remove', activeLine: L('for each removal index'), pythonLine: P('for r in range'), first, second, pre, removed: r, reach: r, best, match: null, message: `Delete first[${r}] (${first[r]}) and compare what follows with second.` })
    let k = 0
    for (;;) {
      const inRange = r + k < m && r + 1 + k < n
      const ok = inRange && first[r + 1 + k] === second[r + k]
      if (!ok) {
        frames.push({ phase: 'slide', activeLine: L('while the letters'), pythonLine: P('while r + k < len(second)'), first, second, pre, removed: r, reach: r + k, best, match: false, message: inRange ? `${first[r + 1 + k]} differs from ${second[r + k]}; the run after removing index ${r} is ${k}.` : `The comparison runs out of letters after ${k} more match${k === 1 ? '' : 'es'}.` })
        break
      }
      k++
      frames.push({ phase: 'slide', activeLine: L('k = k + 1'), pythonLine: P('k += 1'), first, second, pre, removed: r, reach: r + k, best, match: true, message: `${first[r + k]} equals ${second[r + k - 1]} after the gap; the run is now ${k}.` })
    }
    const candidate = r + k
    if (candidate > best) {
      best = candidate
      frames.push({ phase: 'record', activeLine: L('best = max'), pythonLine: P('best = max'), first, second, pre, removed: r, reach: candidate, best, match: true, message: `Removing index ${r} gives length ${candidate}, the new best.` })
    } else {
      frames.push({ phase: 'record', activeLine: L('best = max'), pythonLine: P('best = max'), first, second, pre, removed: r, reach: candidate, best, match: false, message: `Removing index ${r} gives length ${candidate}; the best stays ${best}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), pythonLine: P('return best'), first, second, pre, removed: -1, reach: best, best, result: best, match: null, message: `The longest common prefix after at most one removal is ${best}.` })
  return { input: { first, second }, result: best, frames }
}

export const python = `def longest_prefix_after_one_removal(first, second):
    pre = 0
    while pre < len(first) and pre < len(second) and first[pre] == second[pre]:
        pre += 1
    best = pre
    for r in range(min(pre, len(first) - 1) + 1):
        k = 0
        while r + k < len(second) and r + 1 + k < len(first) and first[r + 1 + k] == second[r + k]:
            k += 1
        best = max(best, r + k)
    return best
`
