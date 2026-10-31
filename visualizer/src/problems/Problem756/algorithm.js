export const code = `function pyramidTransition(bottom, allowed):
  options = map from each base pair to the top letters allowed above it
  failed = empty set of rows that cannot be completed
  define build(row):
    if row has one block then return true
    if row is in failed then return false
    define place(i, cur):
      if i reached the last pair then return build(cur)
      for each top letter c allowed above pair row[i..i+1]:
        if place(i + 1, cur + c) then return true
      return false
    if place(0, empty) then return true
    add row to failed
    return false
  return build(bottom)`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const MAX_FRAMES = 30000

export const python = `from collections import defaultdict

def pyramid_transition(bottom, allowed):
    options = defaultdict(list)
    for a, b, c in allowed:
        options[a + b].append(c)
    failed = set()
    def build(row):
        if len(row) == 1:
            return True
        if row in failed:
            return False
        def place(i, cur):
            if i == len(row) - 1:
                return build(cur)
            for c in options[row[i:i + 2]]:
                if place(i + 1, cur + c):
                    return True
            return False
        if place(0, ''):
            return True
        failed.add(row)
        return False
    return build(bottom)`

export function parseInput(text) {
  const v = JSON.parse(text)
  if (!v || typeof v.bottom !== 'string' || !Array.isArray(v.allowed)) throw new Error('Enter JSON like {"bottom": "BCD", "allowed": ["BCC", "CDE"]}.')
  if (!/^[A-F]{2,6}$/.test(v.bottom)) throw new Error('bottom must be 2-6 letters from A-F.')
  if (v.allowed.length > 40 || !v.allowed.every(t => typeof t === 'string' && /^[A-F]{3}$/.test(t))) throw new Error('allowed must hold at most 40 distinct triples of letters A-F.')
  if (new Set(v.allowed).size !== v.allowed.length) throw new Error('allowed triples must be unique.')
  const run = buildTrace({ bottom: v.bottom, allowed: v.allowed })
  if (run.frames.length > MAX_FRAMES) throw new Error('This search is too large to visualize (over 30,000 steps); shorten the bottom row or the allowed list.')
  return { bottom: v.bottom, allowed: v.allowed }
}

export function buildTrace({ bottom, allowed }) {
  const options = {}
  for (const t of allowed) (options[t.slice(0, 2)] ||= []).push(t[2])
  const failed = new Set()
  const rows = []
  const frames = []
  let overflow = false
  const push = f => { if (frames.length <= MAX_FRAMES) frames.push({ rows: [...rows], failed: failed.size, ...f }); else overflow = true }
  push({ phase: 'start', activeLine: L('options ='), pythonLine: 4, cur: '', i: -1, message: `Group allowed triples by their two base letters: ${Object.entries(options).map(([k, v]) => `${k}->{${v.join('')}}`).join(' ') || '(none)'}.` })
  function build(row) {
    rows.push(row)
    try {
      if (row.length === 1) { push({ phase: 'top', activeLine: L('has one block'), pythonLine: 10, cur: '', i: -1, message: `Row "${row}" has one block: the pyramid is complete.` }); return true }
      if (failed.has(row)) { push({ phase: 'memo', activeLine: L('row is in failed'), pythonLine: 12, cur: '', i: -1, message: `Row "${row}" already failed earlier; skip repeating that search.` }); return false }
      push({ phase: 'row', activeLine: L('define build'), pythonLine: 20, cur: '', i: -1, message: `Build a row above "${row}": each adjacent pair needs an allowed top block.` })
      const place = (i, cur) => {
        if (i === row.length - 1) return build(cur)
        const opts = options[row.slice(i, i + 2)] || []
        if (!opts.length) push({ phase: 'dead', activeLine: L('for each top letter c'), pythonLine: 16, cur, i, message: `No allowed block above "${row.slice(i, i + 2)}": this partial row is a dead end.` })
        for (const c of opts) {
          push({ phase: 'place', activeLine: L('place(i + 1'), pythonLine: 17, cur: cur + c, i, message: `Above "${row.slice(i, i + 2)}" choose ${c}; partial row "${cur + c}".` })
          if (place(i + 1, cur + c)) return true
        }
        return false
      }
      if (place(0, '')) return true
      failed.add(row)
      push({ phase: 'fail', activeLine: L('add row to failed'), pythonLine: 22, cur: '', i: -1, message: `Every choice for the row above "${row}" failed: remember it as failed.` })
      return false
    } finally { rows.pop() }
  }
  const result = build(bottom)
  frames.push({ phase: 'done', activeLine: L('return build'), pythonLine: 24, rows: [], failed: failed.size, cur: '', i: -1, message: result ? 'A full pyramid can be built: true.' : 'No choice of blocks completes a pyramid: false.' })
  if (overflow) frames.length = MAX_FRAMES + 2
  return { input: { bottom, allowed }, result, frames }
}
