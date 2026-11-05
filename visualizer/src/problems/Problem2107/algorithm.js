// LeetCode 2107: Number of Unique Flavors After Sharing K Candies.
// Alice gives away exactly k consecutive candies. Slide a window of length k over the candies and keep
// the count of each flavour that remains; the number of flavours with a remaining count is the answer.

export function parseInput(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"candies":[1,2,2,3],"k":2}.') }
  const { candies, k } = data ?? {}
  if (!Array.isArray(candies) || candies.length < 1 || candies.length > 30 || candies.some(v => !Number.isInteger(v) || v < 1 || v > 9)) {
    throw new Error('candies must hold 1 to 30 flavours, each an integer from 1 to 9.')
  }
  if (!Number.isInteger(k) || k < 1 || k > candies.length) throw new Error('k must be between 1 and the number of candies.')
  return { candies, k }
}

export const code = `function uniqueAfterSharing(candies, k) {
  const remaining = new Map()
  for (const flavour of candies) remaining.set(flavour, (remaining.get(flavour) ?? 0) + 1)
  let distinct = remaining.size
  const take = flavour => {
    remaining.set(flavour, remaining.get(flavour) - 1)
    if (remaining.get(flavour) === 0) distinct--
  }
  const give = flavour => {
    if (remaining.get(flavour) === 0) distinct++
    remaining.set(flavour, remaining.get(flavour) + 1)
  }
  let best = 0
  for (let i = 0; i < candies.length; i++) {
    if (i >= k) give(candies[i - k])
    take(candies[i])
    if (i >= k - 1) best = Math.max(best, distinct)
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: unique_after_sharing
def unique_after_sharing(candies, k):
    remaining = {}
    for flavour in candies:
        remaining[flavour] = remaining.get(flavour, 0) + 1
    distinct = len(remaining)
    best = 0
    for i in range(len(candies)):
        if i >= k:
            flavour = candies[i - k]
            if remaining[flavour] == 0:
                distinct += 1
            remaining[flavour] += 1
        flavour = candies[i]
        remaining[flavour] -= 1
        if remaining[flavour] == 0:
            distinct -= 1
        if i >= k - 1:
            best = max(best, distinct)
    return best
`

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

export const phases = [
  { id: 'start', label: 'Count flavours', description: 'Count every flavour in the full row.' },
  { id: 'window', label: 'Give window', description: 'The block between l and r is given away; those candies leave the count.' },
  { id: 'slide', label: 'Slide', description: 'The window moves right: the leftmost candy returns and a new candy leaves.' },
  { id: 'done', label: 'Result', description: 'The best number of flavours that remain.' },
]

export function buildTrace({ candies, k }) {
  const frames = []
  const n = candies.length
  const remaining = new Map()
  for (const flavour of candies) remaining.set(flavour, (remaining.get(flavour) ?? 0) + 1)
  let distinct = remaining.size
  const show = () => Object.fromEntries([...remaining].sort((a, b) => a[0] - b[0]).map(([f, c]) => [f, c]))
  frames.push({ phase: 'start', activeLine: L('const remaining = new Map'), pythonLine: P('remaining = {}'), message: `${distinct} flavours in the full row.`, l: -1, r: -1, marks: {}, distinct, best: 0, remaining: show() })
  let best = 0
  let bestAt = -1
  for (let i = 0; i < n; i++) {
    if (i >= k) {
      const flavour = candies[i - k]
      if (remaining.get(flavour) === 0) distinct++
      remaining.set(flavour, remaining.get(flavour) + 1)
    }
    remaining.set(candies[i], remaining.get(candies[i]) - 1)
    if (remaining.get(candies[i]) === 0) distinct--
    if (i >= k - 1) {
      const l = i - k + 1
      if (distinct > best) { best = distinct; bestAt = l }
      frames.push({ phase: i === k - 1 ? 'window' : 'slide', activeLine: L('if (i >= k - 1)'), pythonLine: P('if i >= k - 1'), message: `Giving candies ${l} to ${i} leaves ${distinct} flavours; best ${best}.`, l, r: i, marks: Object.fromEntries(Array.from({ length: k }, (_, offset) => [l + offset, 'given'])), distinct, best, remaining: show() })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), pythonLine: P('return best'), message: `Best: ${best} flavours remain${bestAt >= 0 ? ` after giving candies ${bestAt} to ${bestAt + k - 1}` : ''}.`, l: -1, r: -1, marks: {}, distinct: best, best, remaining: show() })
  return { input: { candies, k }, result: best, frames }
}
