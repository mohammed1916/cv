export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 500 || !/^[a-z]+$/.test(s)) throw new Error('Enter a JSON string of 1-500 lowercase letters, e.g. "aab" (visualization cap: 500 characters).')
  return s
}
export function buildTrace(s) {
  const n = s.length
  const counts = new Map()
  for (const c of s) counts.set(c, (counts.get(c) || 0) + 1)
  const order = [...counts.entries()].sort((a, b) => b[1] - a[1])
  const frames = [{ phase: 'start', activeLine: L('const n = s.length'), pythonLine: 4, res: new Array(n).fill(''), i: -1, letter: '', counts: order, message: `Reorganize "${s}" (length ${n}) so that no two adjacent characters are equal.` }]
  frames.push({ phase: 'count', activeLine: L('for (const c of s) count.set'), pythonLine: 5, res: new Array(n).fill(''), i: -1, letter: '', counts: order, message: `Count letters: ${order.map(([c, k]) => `${c}x${k}`).join(', ')}.` })
  const limit = Math.floor((n + 1) / 2)
  const mx = order[0][1]
  if (mx > limit) {
    frames.push({ phase: 'check', activeLine: L('if (order[0][1] >'), pythonLine: 7, res: new Array(n).fill(''), i: -1, letter: order[0][0], counts: order, message: `'${order[0][0]}' appears ${mx} times but at most ${limit} slots can be pairwise non-adjacent in length ${n}. Impossible.` })
    frames.push({ phase: 'done', activeLine: L("return ''"), pythonLine: 8, res: new Array(n).fill(''), i: -1, letter: '', counts: order, message: 'Return the empty string.' })
    return { input: s, result: '', frames }
  }
  frames.push({ phase: 'check', activeLine: L('if (order[0][1] >'), pythonLine: 7, res: new Array(n).fill(''), i: -1, letter: order[0][0], counts: order, message: `Most frequent '${order[0][0]}' x${mx} fits within ${limit} non-adjacent slots, so a solution exists.` })
  const res = new Array(n).fill('')
  let i = 0
  for (const [c, k] of order) {
    for (let t = 0; t < k; t++) {
      res[i] = c
      frames.push({ phase: 'place', activeLine: L('res[i] = c'), pythonLine: 13, res: [...res], i, letter: c, counts: order, message: `Place '${c}' at index ${i}. Then jump by 2 so copies of the same letter never touch.` })
      i += 2
      if (i >= n) {
        const wrapped = i
        i = 1
        frames.push({ phase: 'wrap', activeLine: L('if (i >= n) i = 1'), pythonLine: 16, res: [...res], i: -1, letter: c, counts: order, message: `Index ${wrapped} is past the end, so wrap to the odd slots starting at 1.` })
      }
    }
  }
  const result = res.join('')
  frames.push({ phase: 'done', activeLine: L('return res.join'), pythonLine: 17, res: [...res], i: -1, letter: '', counts: order, message: `Return "${result}".` })
  return { input: s, result, frames }
}
export const code = `function reorganizeString(s) {
  const n = s.length
  const count = new Map()
  for (const c of s) count.set(c, (count.get(c) ?? 0) + 1)
  const order = [...count.entries()].sort((a, b) => b[1] - a[1])
  if (order[0][1] > Math.floor((n + 1) / 2)) return ''
  const res = Array(n).fill('')
  let i = 0
  for (const [c, k] of order) {
    for (let t = 0; t < k; t++) {
      res[i] = c
      i += 2
      if (i >= n) i = 1
    }
  }
  return res.join('')
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import Counter

def reorganize_string(s):
    n = len(s)
    cnt = Counter(s)
    order = cnt.most_common()
    if order[0][1] > (n + 1) // 2:
        return ""
    res = [''] * n
    i = 0
    for c, k in order:
        for _ in range(k):
            res[i] = c
            i += 2
            if i >= n:
                i = 1
    return ''.join(res)`
