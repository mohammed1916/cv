export function parseInput(text) {
  const v = JSON.parse(text)
  const err = 'Enter {"order":"cba","s":"abcd"}: lowercase letters only, order has 1-26 distinct letters, s has 1-40 letters.'
  if (!v || typeof v.order !== 'string' || typeof v.s !== 'string') throw new Error(err)
  const { order, s } = v
  if (!/^[a-z]{1,26}$/.test(order) || new Set(order).size !== order.length || !/^[a-z]{1,40}$/.test(s)) throw new Error(err)
  return { order, s }
}
export function buildTrace({ order, s }) {
  const count = new Map()
  const entries = () => [...count.entries()].map(([ch, c]) => `${ch}:${c}`)
  const frames = [{ phase: 'start', activeLine: 2, counts: [], out: '', current: '', message: 'Plan: count how often each character occurs in s, then rebuild the string following the custom order.' }]
  for (const ch of s) {
    count.set(ch, (count.get(ch) || 0) + 1)
    frames.push({ phase: 'count', activeLine: 4, counts: entries(), out: '', current: ch, message: `Read "${ch}" from s: its count becomes ${count.get(ch)}.` })
  }
  let out = ''
  for (const ch of order) {
    if (count.has(ch)) {
      const c = count.get(ch)
      count.delete(ch)
      out += ch.repeat(c)
      frames.push({ phase: 'emit', activeLine: 8, counts: entries(), out, current: ch, message: `"${ch}" is next in the custom order and occurs ${c} time(s) in s: append "${ch.repeat(c)}" and remove it from the counts.` })
    } else {
      frames.push({ phase: 'miss', activeLine: 6, counts: entries(), out, current: ch, message: `"${ch}" is in the order but not in s: nothing to append.` })
    }
  }
  for (const [ch, c] of [...count.entries()]) {
    out += ch.repeat(c)
    frames.push({ phase: 'rest', activeLine: 10, counts: entries(), out, current: ch, message: `"${ch}" is not in the order, so its position is free: append "${ch.repeat(c)}" at the end.` })
  }
  frames.push({ phase: 'done', activeLine: 11, counts: [], out, current: '', message: `Result: "${out}".` })
  return { input: { order, s }, result: out, frames }
}
export const code = `def customSortString(order, s):
    count = {}
    for ch in s:
        count[ch] = count.get(ch, 0) + 1
    out = []
    for ch in order:
        if ch in count:
            out.append(ch * count.pop(ch))
    for ch, c in count.items():
        out.append(ch * c)
    return "".join(out)`.split('\n').map((text, index) => ({ line: index + 1, text }))
