// LeetCode 1957: keep each letter unless it would make three equal letters in a row; a stack holds the answer so far.
const SOURCE = [
  "function makeFancyString(s) {",
  "  const out = []",
  "  for (const ch of s) {",
  "    const n = out.length",
  "    if (n >= 2 && out[n - 1] === ch && out[n - 2] === ch) continue",
  "    out.push(ch)",
  "  }",
  "  return out.join('')",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def make_fancy_string(s):
    out = []
    for ch in s:
        n = len(out)
        if n >= 2 and out[n - 1] == ch and out[n - 2] == ch:
            continue
        out.append(ch)
    return "".join(out)
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'scan', label: 'Scan', description: 'Keep or delete each character as it arrives.' },
  { id: 'done', label: 'Result', description: 'The kept characters, in order.' },
]

export function parseInput(text) {
  const s = String(text).trim()
  if (!/^[a-z]{1,30}$/.test(s)) throw new Error('Enter 1 to 30 lowercase letters.')
  return { s }
}

export function buildTrace({ s }) {
  const frames = []
  const out = []
  const status = []
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    const n = out.length
    const drop = n >= 2 && out[n - 1] === ch && out[n - 2] === ch
    if (!drop) out.push(ch)
    status.push(drop ? 'deleted' : 'kept')
    frames.push({ phase: 'scan', activeLine: L(drop ? 'continue' : 'out.push'), pythonLine: P(drop ? 'continue' : 'out.append'), message: drop ? `"${ch}" would be the third in a row, so it is deleted.` : `"${ch}" is kept.`, i, status: [...status], out: out.join('') })
  }
  const result = out.join('')
  frames.push({ phase: 'done', activeLine: L('return out.join'), pythonLine: P('return "".join'), message: `Result: ${result}.`, i: -1, status: [...status], out: result })
  return { input: { s }, result, frames }
}
