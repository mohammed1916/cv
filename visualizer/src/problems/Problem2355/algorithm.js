export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.books)) throw new Error('Use an object with books.')
  const { books } = input
  if (books.length < 1 || books.length > 12) throw new Error('books has 1 to 12 shelves.')
  if (!books.every(x => Number.isInteger(x) && x >= 0 && x <= 12)) throw new Error('Each shelf holds 0 to 12 books.')
  return { books }
}

export function buildTrace({ books }) {
  const n = books.length
  const frames = []
  let best = 0
  let bestRange = null
  for (let r = 0; r < n; r++) {
    let cur = books[r]
    let sum = cur
    let l = r
    frames.push({ phase: 'end', activeLine: CL('let cur = books[r]'), pythonLine: PL('cur = books[r]'), r, l: r, taken: books.map((_, k) => (k === r ? cur : null)), sum, best, bestRange, message: `Take ${cur} from shelf ${r}, the most it can hold here.` })
    for (let k = r - 1; k >= 0; k--) {
      cur = Math.min(books[k], cur - 1)
      if (cur <= 0) {
        frames.push({ phase: 'stop', activeLine: CL('if (cur <= 0)'), pythonLine: PL('if cur <= 0'), r, l: l, taken: null, sum, best, bestRange, message: `Shelf ${k} can give no book that keeps the counts strictly rising, so the section starts at ${l}.` })
        break
      }
      sum += cur
      l = k
      frames.push({ phase: 'extend', activeLine: CL('sum += cur'), pythonLine: PL('total += cur'), r, l, taken: null, sum, best, bestRange, message: `Shelf ${k} gives ${cur}, which is below shelf ${k + 1}'s count. Section ${l}..${r} totals ${sum}.` })
    }
    if (sum > best) { best = sum; bestRange = [l, r] }
    frames.push({ phase: 'record', activeLine: CL('best = Math.max'), pythonLine: PL('best = max(best'), r, l, taken: null, sum, best, bestRange, message: `Sections ending at ${r} total up to ${sum}. Best so far ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: CL('return best'), pythonLine: PL('return best'), r: -1, l: -1, taken: null, sum: 0, best, bestRange, message: `The most books you can take is ${best}.` })
  return { input: { books }, result: best, frames }
}

export const code = `function maxBooks(books) {
  let best = 0;
  for (let r = 0; r < books.length; r++) {
    let cur = books[r];
    let sum = cur;
    for (let k = r - 1; k >= 0; k--) {
      cur = Math.min(books[k], cur - 1);
      if (cur <= 0) break;
      sum += cur;
    }
    best = Math.max(best, sum);
  }
  return best;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def max_books(books):
    best = 0
    for r in range(len(books)):
        cur = books[r]
        total = cur
        for k in range(r - 1, -1, -1):
            cur = min(books[k], cur - 1)
            if cur <= 0:
                break
            total += cur
        best = max(best, total)
    return best
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
