export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with the multiset of all subset sums of the unknown array.' },
  { id: 'try', label: 'Try an element', description: 'Guess one element x, then peel off every sum that pairs with a sum plus x.' },
  { id: 'accept', label: 'Accept element', description: 'The half that remains has the subset sums of the other elements, so recurse on it.' },
  { id: 'done', label: 'Result', description: 'Return the recovered elements.' },
]

export const code = `function recoverArray(n, sums) {
  return recover(n, [...sums].sort((a, b) => a - b))
}

function recover(n, sums) {
  if (n === 0) return []
  for (const x of [...new Set(sums)]) {
    const half = splitSums(sums, x)
    if (half === null) continue
    const rest = recover(n - 1, half)
    if (rest !== null) return [...rest, x]
  }
  return null
}

function splitSums(sums, x) {
  const counts = new Map()
  for (const s of sums) counts.set(s, (counts.get(s) ?? 0) + 1)
  if (x === 0) {
    const half = []
    for (const [value, count] of counts) {
      if (count % 2 !== 0) return null
      for (let c = 0; c < count / 2; c++) half.push(value)
    }
    return half
  }
  const order = [...counts.keys()].sort((a, b) => (x > 0 ? a - b : b - a))
  const half = []
  for (const value of order) {
    while (counts.get(value) > 0) {
      const partner = value + x
      if (!(counts.get(partner) > 0)) return null
      counts.set(value, counts.get(value) - 1)
      counts.set(partner, counts.get(partner) - 1)
      half.push(value)
    }
  }
  return half.sort((a, b) => a - b)
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def recover_array(n, sums):
    return recover(n, sorted(sums))

def recover(n, sums):
    if n == 0:
        return []
    for x in sorted(set(sums)):
        half = split_sums(sums, x)
        if half is None:
            continue
        rest = recover(n - 1, half)
        if rest is not None:
            return rest + [x]
    return None

def split_sums(sums, x):
    counts = {}
    for s in sums:
        counts[s] = counts.get(s, 0) + 1
    if x == 0:
        half = []
        for value, count in counts.items():
            if count % 2 != 0:
                return None
            half.extend([value] * (count // 2))
        return half
    order = sorted(counts.keys(), key=lambda v: v if x > 0 else -v)
    half = []
    for value in order:
        while counts[value] > 0:
            partner = value + x
            if counts.get(partner, 0) <= 0:
                return None
            counts[value] -= 1
            counts[partner] -= 1
            half.append(value)
    return sorted(half)
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let obj
  try { obj = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"n":2,"sums":[0,1,2,3]}.') }
  const { n, sums } = obj || {}
  if (!Number.isInteger(n) || n < 1 || n > 8) throw new Error('This visual accepts n from 1 to 8.')
  if (!Array.isArray(sums) || sums.length !== 2 ** n) throw new Error(`sums must contain exactly ${2 ** n} values.`)
  if (!sums.every(v => Number.isInteger(v) && Math.abs(v) <= 10000)) throw new Error('Each sum must be a whole number between -10000 and 10000.')
  if (!sums.includes(0)) throw new Error('The empty subset gives 0, so sums must contain 0.')
  return { n, sums }
}

export function buildTrace({ n, sums }) {
  const frames = []
  const add = (phase, c, p, message, extra) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { n, remaining: extra.remaining, x: extra.x ?? null, half: extra.half ?? [], chosen: extra.chosen ?? [], status: extra.status ?? '' },
  })
  const sorted = [...sums].sort((a, b) => a - b)
  add('start', 'return recover', 'return recover', `The ${sorted.length} subset sums are sorted; the array has ${n} elements.`, { remaining: sorted })
  const split = (values, x) => {
    const counts = new Map()
    for (const s of values) counts.set(s, (counts.get(s) ?? 0) + 1)
    if (x === 0) {
      const half = []
      for (const [value, count] of counts) {
        if (count % 2 !== 0) return null
        for (let c = 0; c < count / 2; c++) half.push(value)
      }
      return half
    }
    const order = [...counts.keys()].sort((a, b) => (x > 0 ? a - b : b - a))
    const half = []
    for (const value of order) {
      while (counts.get(value) > 0) {
        const partner = value + x
        if (!(counts.get(partner) > 0)) return null
        counts.set(value, counts.get(value) - 1)
        counts.set(partner, counts.get(partner) - 1)
        half.push(value)
      }
    }
    return half.sort((a, b) => a - b)
  }
  const recurse = (level, values, chosen) => {
    if (level === 0) return []
    for (const x of [...new Set(values)]) {
      const half = split(values, x)
      if (half === null) {
        add('try', 'if (half === null)', 'if half is None', `Guess ${x}: some sum has no partner, so this guess fails.`, { remaining: values, x, half: [], chosen, status: 'fails' })
        continue
      }
      add('try', 'const rest = recover', 'rest = recover', `Guess ${x}: the sums with and without ${x} split into ${half.length} values for the other elements.`, { remaining: values, x, half, chosen, status: 'splits' })
      const rest = recurse(level - 1, half, [...chosen, x])
      if (rest !== null) {
        add('accept', 'return [...rest', 'return rest + [x]', `Accept ${x}; ${level - 1} elements remain to be recovered.`, { remaining: half, x, half, chosen: [...chosen, x], status: 'accepted' })
        return [...rest, x]
      }
    }
    return null
  }
  const answer = recurse(n, sorted, [])
  if (answer === null) throw new Error('No array matches these sums.')
  const result = answer.slice().sort((a, b) => a - b)
  add('done', 'return recover', 'return recover', `Recovered array ${JSON.stringify(result)}.`, { remaining: [], chosen: result })
  return { input: { n, sums }, result, frames }
}
