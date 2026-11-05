const CODE_TEXT = `function matchAlphanumericPattern(board, pattern) {
  const rows = board.length
  const cols = board[0].length
  const pr = pattern.length
  const pc = pattern[0].length
  const literal = new Set()
  for (const row of pattern) for (const ch of row) if (/[0-9]/.test(ch)) literal.add(Number(ch))
  for (let r = 0; r <= rows - pr; r++) {
    for (let c = 0; c <= cols - pc; c++) {
      const mapping = {}
      let ok = true
      for (let p = 0; p < pr && ok; p++) {
        for (let q = 0; q < pc; q++) {
          const ch = pattern[p][q]
          const v = board[r + p][c + q]
          if (/[0-9]/.test(ch)) { if (v !== Number(ch)) { ok = false; break } }
          else if (ch in mapping) { if (mapping[ch] !== v) { ok = false; break } }
          else if (literal.has(v) || Object.values(mapping).includes(v)) { ok = false; break }
          else mapping[ch] = v
        }
      }
      if (ok) return [r, c]
    }
  }
  return [-1, -1]
}`
const PYTHON_TEXT = `def match_alphanumerical_pattern(board, pattern):
    rows, cols = len(board), len(board[0])
    pr, pc = len(pattern), len(pattern[0])
    literal = set()
    for row in pattern:
        for ch in row:
            if ch.isdigit():
                literal.add(int(ch))
    for r in range(rows - pr + 1):
        for c in range(cols - pc + 1):
            mapping = {}
            ok = True
            for p in range(pr):
                for q in range(pc):
                    ch = pattern[p][q]
                    v = board[r + p][c + q]
                    if ch.isdigit():
                        if v != int(ch):
                            ok = False
                    elif ch in mapping:
                        if mapping[ch] != v:
                            ok = False
                    elif v in literal or v in mapping.values():
                        ok = False
                    else:
                        mapping[ch] = v
                    if not ok:
                        break
                if not ok:
                    break
            if ok:
                return [r, c]
    return [-1, -1]`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = PYTHON_TEXT
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`No pseudocode line: ${s}`); return i + 1 }
const PY = s => { const i = python.split('\n').findIndex(t => t.includes(s)); if (i < 0) throw new Error(`No python line: ${s}`); return i + 1 }

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.board) || !Array.isArray(input.pattern)) throw new Error('Use an object with board (rows of digits) and pattern (rows of strings).')
  const { board, pattern } = input
  if (board.length < 1 || board.length > 6 || !board.every(row => Array.isArray(row) && row.length === board[0].length && row.length >= 1 && row.length <= 6 && row.every(v => Number.isInteger(v) && v >= 0 && v <= 9))) throw new Error('board is a rectangle of 1 to 6 rows and columns with digits 0 to 9.')
  if (pattern.length < 1 || pattern.length > 4 || !pattern.every(row => typeof row === 'string' && row.length === pattern[0].length && row.length >= 1 && row.length <= 4 && /^[0-9a-z]+$/.test(row))) throw new Error('pattern is a rectangle of 1 to 4 rows and columns of digits or lowercase letters.')
  return { board, pattern }
}

export function buildTrace({ board, pattern }) {
  const frames = []
  const rows = board.length
  const cols = board[0].length
  const pr = pattern.length
  const pc = pattern[0].length
  const literal = new Set()
  for (const row of pattern) for (const ch of row) if (/[0-9]/.test(ch)) literal.add(Number(ch))
  let answer = [-1, -1]
  frames.push({ phase: 'start', activeLine: L('const rows = board.length'), pythonLine: PY('rows, cols'), window: null, cell: null, mapping: {}, literal: [...literal], answer, message: `Literal digits in the pattern: ${[...literal].join(', ') || 'none'}.` })
  for (let r = 0; r <= rows - pr; r++) {
    for (let c = 0; c <= cols - pc; c++) {
      const mapping = {}
      let ok = true
      frames.push({ phase: 'window', activeLine: L('for (let r = 0'), pythonLine: PY('for c in range'), window: [r, c], cell: null, mapping: {}, literal: [...literal], answer, message: `Try the window with top-left corner (${r}, ${c}).` })
      for (let p = 0; p < pr && ok; p++) {
        for (let q = 0; q < pc; q++) {
          const ch = pattern[p][q]
          const v = board[r + p][c + q]
          if (/[0-9]/.test(ch)) {
            if (v !== Number(ch)) { ok = false; frames.push({ phase: 'fail', activeLine: L('if (/[0-9]/.test(ch)) { if'), pythonLine: PY('if v != int(ch)'), window: [r, c], cell: [p, q], mapping: { ...mapping }, literal: [...literal], answer, message: `Cell (${p}, ${q}) needs ${ch} but the board has ${v}.` }); break }
            frames.push({ phase: 'literal', activeLine: L('if (/[0-9]/.test(ch)) { if'), pythonLine: PY('if v != int(ch)'), window: [r, c], cell: [p, q], mapping: { ...mapping }, literal: [...literal], answer, message: `Literal ${ch} matches the board value ${v}.` })
          } else if (ch in mapping) {
            if (mapping[ch] !== v) { ok = false; frames.push({ phase: 'fail', activeLine: L('else if (ch in mapping)'), pythonLine: PY('if mapping[ch] != v'), window: [r, c], cell: [p, q], mapping: { ...mapping }, literal: [...literal], answer, message: `Letter ${ch} is ${mapping[ch]}, not ${v}.` }); break }
            frames.push({ phase: 'match', activeLine: L('else if (ch in mapping)'), pythonLine: PY('elif ch in mapping'), window: [r, c], cell: [p, q], mapping: { ...mapping }, literal: [...literal], answer, message: `Letter ${ch} keeps its digit ${v}.` })
          } else if (literal.has(v) || Object.values(mapping).includes(v)) {
            ok = false
            frames.push({ phase: 'fail', activeLine: L('else if (literal.has(v)'), pythonLine: PY('elif v in literal'), window: [r, c], cell: [p, q], mapping: { ...mapping }, literal: [...literal], answer, message: `Digit ${v} is already a literal or taken by another letter.` })
            break
          } else {
            mapping[ch] = v
            frames.push({ phase: 'map', activeLine: L('else mapping[ch] = v'), pythonLine: PY('mapping[ch] = v'), window: [r, c], cell: [p, q], mapping: { ...mapping }, literal: [...literal], answer, message: `Letter ${ch} is mapped to digit ${v}.` })
          }
        }
      }
      if (ok) {
        answer = [r, c]
        frames.push({ phase: 'found', activeLine: L('if (ok) return [r, c]'), pythonLine: PY('return [r, c]'), window: [r, c], cell: null, mapping: { ...mapping }, literal: [...literal], answer, message: `Every cell passes at (${r}, ${c}).` })
        return { input: { board, pattern }, result: answer, frames }
      }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return [-1, -1]'), pythonLine: PY('return [-1, -1]'), window: null, cell: null, mapping: {}, literal: [...literal], answer, message: 'No window matches, so the answer is [-1, -1].' })
  return { input: { board, pattern }, result: answer, frames }
}
