export function parseInput(text) {
  const data = JSON.parse(text)
  const { n, presses } = data ?? {}
  if (!Number.isInteger(n) || n < 1 || n > 6) throw new Error('n must be an integer from 1 to 6 (every state is shown).')
  if (!Number.isInteger(presses) || presses < 0 || presses > 6) throw new Error('presses must be an integer from 0 to 6.')
  return { n, presses }
}

// The four buttons flip all bulbs; odd positions; even positions; positions 1, 4, 7, …
const buttons = () => [
  bits => bits.map(b => 1 - b),
  bits => bits.map((b, i) => (i % 2 === 0 ? 1 - b : b)),
  bits => bits.map((b, i) => (i % 2 === 1 ? 1 - b : b)),
  bits => bits.map((b, i) => (i % 3 === 0 ? 1 - b : b)),
]

// Breadth-first over exactly `presses` button presses: keep the set of distinct bulb states at each depth.
export function buildTrace({ n, presses }) {
  const press = buttons()
  let level = new Map([[Array(n).fill(1).join(''), Array(n).fill(1)]])
  const frames = [{ phase: 'start', depth: 0, states: [...level.keys()], activeLine: 2, message: `Start with all ${n} bulbs on: one state.` }]
  for (let d = 1; d <= presses; d++) {
    const next = new Map()
    for (const bits of level.values()) for (const f of press) {
      const after = f(bits)
      next.set(after.join(''), after)
    }
    level = next
    frames.push({ phase: 'press', depth: d, states: [...level.keys()], activeLine: 5, message: `After ${d} press${d === 1 ? '' : 'es'}: ${level.size} distinct state${level.size === 1 ? '' : 's'}.` })
  }
  const result = level.size
  frames.push({ phase: 'done', depth: presses, states: [...level.keys()], result, activeLine: 8, message: `${result} distinct states after exactly ${presses} presses.` })
  return { input: { n, presses }, result, frames }
}

export const code = `def flipLights(n, presses):
    states = {tuple([1] * n)}
    for _ in range(presses):
        nxt = set()
        for s in states:
            for f in (flip_all, flip_even, flip_odd, flip_mod3):
                nxt.add(f(s))
        states = nxt
    return len(states)`.split('\n').map((text, index) => ({ line: index + 1, text }))
