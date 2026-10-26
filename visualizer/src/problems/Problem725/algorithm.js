export function parseInput(text) {
  const data = JSON.parse(text)
  const { values, k } = data ?? {}
  if (!Array.isArray(values) || values.length > 1000 || values.some(v => !Number.isInteger(v) || Math.abs(v) > 1000)) throw new Error('values must be up to 1,000 integers with |v| ≤ 1,000.')
  if (!Number.isInteger(k) || k < 1 || k > 50) throw new Error('k must be an integer from 1 to 50.')
  return { values, k }
}

// Each part gets floor(n / k) nodes, and the first n mod k parts get one extra.
export function buildTrace({ values, k }) {
  const n = values.length
  const base = Math.floor(n / k), extra = n % k
  const parts = []
  const frames = [{ phase: 'start', parts: [], sizes: [], activeLine: 2, message: `${n} nodes into ${k} parts: ${base} each, with ${extra} part${extra === 1 ? '' : 's'} getting one more.` }]
  let cursor = 0
  for (let p = 0; p < k; p++) {
    const size = base + (p < extra ? 1 : 0)
    parts.push(values.slice(cursor, cursor + size))
    cursor += size
    frames.push({ phase: 'cut', parts: parts.map(x => [...x]), sizes: parts.map(x => x.length), current: p, activeLine: 6, message: `Part ${p} takes ${size} node${size === 1 ? '' : 's'}.` })
  }
  frames.push({ phase: 'done', parts: parts.map(x => [...x]), sizes: parts.map(x => x.length), result: parts, activeLine: 9, message: `Built ${k} parts.` })
  return { input: { values, k }, result: parts, frames }
}

export const code = `def splitListToParts(values, k):
    n = len(values)
    base, extra = divmod(n, k)
    out, i = [], 0
    for p in range(k):
        size = base + (1 if p < extra else 0)
        out.append(values[i:i + size])
        i += size
    return out`.split('\n').map((text, index) => ({ line: index + 1, text }))
