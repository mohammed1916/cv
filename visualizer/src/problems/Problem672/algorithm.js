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
  const frames = [{ phase: 'start', depth: 0, states: [...level.keys()], activeLine: L('set states to the single'), message: `Start with all ${n} bulbs on: one state.` }]
  for (let d = 1; d <= presses; d++) {
    const next = new Map()
    for (const bits of level.values()) for (const f of press) {
      const after = f(bits)
      next.set(after.join(''), after)
    }
    level = next
    frames.push({ phase: 'press', depth: d, states: [...level.keys()], activeLine: L('set states to nxt'), message: `After ${d} press${d === 1 ? '' : 'es'}: ${level.size} distinct state${level.size === 1 ? '' : 's'}.` })
  }
  const result = level.size
  frames.push({ phase: 'done', depth: presses, states: [...level.keys()], result, activeLine: L('return the number of states'), message: `${result} distinct states after exactly ${presses} presses.` })
  return { input: { n, presses }, result, frames }
}

export const code = `function flipLights(n, presses):
  set states to the single state with all n bulbs on
  repeat presses times:
    set nxt to an empty set of states
    for each state s in states:
      for each of the four buttons f:
        add f(s) to nxt
    set states to nxt
  return the number of states`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def flip_lights(n, presses):
    def flip_all(s):
        return tuple(1 - b for b in s)

    def flip_odd(s):
        return tuple(1 - b if i % 2 == 0 else b for i, b in enumerate(s))

    def flip_even(s):
        return tuple(1 - b if i % 2 == 1 else b for i, b in enumerate(s))

    def flip_mod3(s):
        return tuple(1 - b if i % 3 == 0 else b for i, b in enumerate(s))

    buttons = (flip_all, flip_odd, flip_even, flip_mod3)
    states = {tuple([1] * n)}
    for _ in range(presses):
        nxt = set()
        for s in states:
            for f in buttons:
                nxt.add(f(s))
        states = nxt
    return len(states)
`
