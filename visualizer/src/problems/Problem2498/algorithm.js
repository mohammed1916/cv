export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with stones.')
  const { stones } = input
  if (!Array.isArray(stones) || stones.length < 2 || stones.length > 12) throw new Error('stones has 2 to 12 entries.')
  if (stones[0] !== 0) throw new Error('The first stone is at position 0.')
  if (!stones.every((x, i) => Number.isInteger(x) && x >= 0 && x <= 1000 && (i === 0 || x > stones[i - 1]))) throw new Error('stones are strictly increasing integers.')
  return { stones }
}

export function buildTrace({ stones }) {
  const frames = []
  let best = stones[1] - stones[0]
  frames.push({ pythonLine: PL('best = stones[1]'), phase: 'setup', activeLine: CL('best <-'), at: 1, from: 0, best, message: `The first jump is ${best}.` })
  for (let i = 2; i < stones.length; i++) {
    const gap = stones[i] - stones[i - 2]
    frames.push({ pythonLine: PL('best = max('), phase: 'gap', activeLine: CL('gap <- stones'), at: i, from: i - 2, best, gap, message: `Stones ${i - 2} and ${i} are ${gap} apart.` })
    best = Math.max(best, gap)
    frames.push({ pythonLine: PL('best = max('), phase: 'update', activeLine: CL('best <- larger'), at: i, from: i - 2, best, gap, message: `Best jump is now ${best}.` })
  }
  frames.push({ pythonLine: PL('return best'), phase: 'done', activeLine: CL('RETURN best'), at: -1, from: -1, best, message: `The frog's largest jump is ${best}.` })
  return { input: { stones }, result: best, frames }
}

export const code = `FUNCTION maxJump(stones)
  best <- the jump from stones[0] to stones[1]
  FOR i from 2 to the last stone
    gap <- stones[i] minus stones[i-2]
    best <- larger of best and gap
  RETURN best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def max_jump(stones):
    best = stones[1] - stones[0]
    for i in range(2, len(stones)):
        best = max(best, stones[i] - stones[i - 2])
    return best
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
