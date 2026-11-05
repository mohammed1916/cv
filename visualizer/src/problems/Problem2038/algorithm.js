export const phases = [
  { id: 'start', label: 'Count moves', description: 'Each piece with both neighbours the same colour gives its owner one move.' },
  { id: 'window', label: 'Window of three', description: 'The window from l to r is three pieces; its middle piece is removable when its colour matches both ends.' },
  { id: 'done', label: 'Result', description: 'Alice wins when she has more removable pieces than Bob.' },
]

export const code = `function winnerOfColoredPieces(colors) {
  let alice = 0
  let bob = 0
  for (let i = 1; i + 1 < colors.length; i++) {
    if (colors[i - 1] === colors[i] && colors[i] === colors[i + 1]) {
      if (colors[i] === 'A') alice++
      else bob++
    }
  }
  return alice > bob
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def winner_of_colored_pieces(colors):
    alice = 0
    bob = 0
    for i in range(1, len(colors) - 1):
        if colors[i - 1] == colors[i] == colors[i + 1]:
            if colors[i] == 'A':
                alice += 1
            else:
                bob += 1
    return alice > bob
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let obj
  try { obj = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"colors":"AAABABB"}.') }
  const colors = obj?.colors
  if (typeof colors !== 'string' || colors.length < 1 || colors.length > 60 || !/^[AB]+$/.test(colors)) throw new Error('colors must be 1 to 60 letters, each A or B.')
  return colors
}

export function buildTrace(colors) {
  const frames = []
  let alice = 0
  let bob = 0
  const add = (phase, c, p, message, i) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { colors, l: i - 1, r: i + 1, index: i, alice, bob },
  })
  add('start', 'let alice = 0', 'alice = 0', 'Scan the interior pieces.', -1)
  for (let i = 1; i + 1 < colors.length; i++) {
    if (colors[i - 1] === colors[i] && colors[i] === colors[i + 1]) {
      if (colors[i] === 'A') alice++
      else bob++
      add('window', 'if (colors[i - 1] === colors[i]', "if colors[i - 1] == colors[i] == colors[i + 1]", `Window ${i - 1} to ${i + 1}: all ${colors[i]}, so ${colors[i]} gains a move. Alice ${alice}, Bob ${bob}.`, i)
    } else {
      add('window', 'if (colors[i - 1] === colors[i]', "if colors[i - 1] == colors[i] == colors[i + 1]", `Window ${i - 1} to ${i + 1} mixes colours: no move.`, i)
    }
  }
  const result = alice > bob
  add('done', 'return alice > bob', 'return alice > bob', `Alice has ${alice} moves and Bob has ${bob}: ${result ? 'Alice wins' : 'Bob wins'}.`, colors.length - 2)
  return { input: colors, result, frames }
}
