export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).join() !== 's') throw new Error('Use a JSON object with one key: {"s": "aababbb"}.')
  if (typeof input.s !== 'string' || !/^[a-z]{1,20}$/.test(input.s)) throw new Error('s must be 1 to 20 lowercase letters.')
  return { s: input.s }
}

const shown = v => (v === -Infinity ? 'none' : v)

export function buildTrace(input) {
  const { s } = input
  const letters = [...new Set(s)]
  let best = 0
  const frames = [{ phase: 'start', activeLine: L('set best to zero'), pair: null, index: -1, opened: 0, paired: null, best, message: 'Try every ordered pair of different letters a and b. Count a as +1 and b as -1, and keep only windows that contain b.' }]
  for (const a of letters) {
    for (const b of letters) {
      if (a === b) continue
      let opened = 0
      let paired = -Infinity
      frames.push({ phase: 'pair', activeLine: L('set opened to zero'), pair: [a, b], index: -1, opened, paired: null, best, message: `Pair a=${a}, b=${b}: start with no open window.` })
      for (let j = 0; j < s.length; j++) {
        const c = s[j]
        if (c !== a && c !== b) continue
        let line
        if (c === a) {
          opened += 1
          paired += 1
          line = L('add one to opened')
        } else {
          paired = Math.max(paired - 1, opened - 1)
          opened = Math.max(0, opened - 1)
          line = L('paired to the larger')
        }
        best = Math.max(best, paired)
        frames.push({ phase: 'scan', activeLine: line, pair: [a, b], index: j, opened, paired: shown(paired), best, message: `${c} at ${j} for pair a=${a}, b=${b}: best variance so far ${best}.` })
      }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), pair: null, index: -1, opened: 0, paired: null, best, message: `Largest variance is ${best}.` })
  return { input: { s }, result: best, frames }
}

export const code = `Largest variance of a string
set best to zero
for each ordered pair of different letters a and b that both appear
  set opened to zero and paired to nothing
  for each character c from left to right
    if c is a then add one to opened and add one to paired
    otherwise if c is b then set paired to the larger of paired minus one and opened minus one, and set opened to the larger of zero and opened minus one
    set best to the larger of best and paired
return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def largest_variance(s):
    letters = set(s)
    best = 0
    for a in letters:
        for b in letters:
            if a == b:
                continue
            opened = 0
            paired = float('-inf')
            for c in s:
                if c == a:
                    opened += 1
                    paired += 1
                elif c == b:
                    paired = max(paired - 1, opened - 1)
                    opened = max(0, opened - 1)
                best = max(best, paired)
    return best
`
