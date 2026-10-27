const INTRO = 1
const EXTRO = 2
const MAX_SIDE = 3

export function parseInput(text) {
  const data = JSON.parse(text)
  const { m, n, introverts, extroverts } = data ?? {}
  if (!Number.isInteger(m) || m < 1 || m > MAX_SIDE) throw new Error(`m must be an integer from 1 to ${MAX_SIDE}.`)
  if (!Number.isInteger(n) || n < 1 || n > MAX_SIDE) throw new Error(`n must be an integer from 1 to ${MAX_SIDE}.`)
  if (!Number.isInteger(introverts) || introverts < 0 || introverts > m * n) throw new Error('introverts must be an integer from 0 to m*n.')
  if (!Number.isInteger(extroverts) || extroverts < 0 || extroverts > m * n) throw new Error('extroverts must be an integer from 0 to m*n.')
  return { m, n, introverts, extroverts }
}

export const code = `max grid happiness(m, n, introverts, extroverts)
  set states to {the empty row profile with 0 people placed: 0}
  for each cell (r, c) in row-major order
    set next to nothing
    for each state, and each choice of empty, introvert or extrovert for this cell
      add the base happiness and the neighbour effects of the cell above and to the left
      keep the best total for the new profile and counts in next
    replace states with next
  return the largest total in states`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

const base = s => (s === INTRO ? 120 : s === EXTRO ? 40 : 0)
const effect = s => (s === INTRO ? -30 : s === EXTRO ? 20 : 0)

// A profile holds the state of the last n cells in column order. Only the cell above and the cell to the left matter.
export function buildTrace({ m, n, introverts, extroverts }) {
  let states = new Map()
  const start = { profile: Array(n).fill(0), intro: 0, extro: 0, score: 0 }
  states.set(`${start.profile.join(',')}|0|0`, start)
  const counts = Array(m * n).fill(null)
  const frames = [{ phase: 'start', cell: null, states: 1, best: 0, counts: [...counts], activeLine: L('set states to'), message: 'The grid starts empty.' }]
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      const next = new Map()
      for (const st of states.values()) {
        for (const s of [0, INTRO, EXTRO]) {
          if (s === INTRO && st.intro >= introverts) continue
          if (s === EXTRO && st.extro >= extroverts) continue
          const up = st.profile[c]
          const left = c > 0 ? st.profile[c - 1] : 0
          let gain = base(s)
          if (s !== 0) {
            if (up !== 0) gain += effect(s) + effect(up)
            if (left !== 0) gain += effect(s) + effect(left)
          }
          const profile = [...st.profile]
          profile[c] = s
          const intro = st.intro + (s === INTRO ? 1 : 0)
          const extro = st.extro + (s === EXTRO ? 1 : 0)
          const key = `${profile.join(',')}|${intro}|${extro}`
          const score = st.score + gain
          const prev = next.get(key)
          if (!prev || score > prev.score) next.set(key, { profile, intro, extro, score })
        }
      }
      states = next
      const best = Math.max(...[...states.values()].map(v => v.score))
      counts[r * n + c] = states.size
      frames.push({ phase: 'cell', cell: [r, c], states: states.size, best, counts: [...counts], activeLine: L('for each state, and each choice'), message: `Cell (${r + 1}, ${c + 1}): ${states.size} profile(s) kept, best running total ${best}.` })
    }
  }
  const result = Math.max(...[...states.values()].map(v => v.score))
  frames.push({ phase: 'done', cell: null, states: states.size, best: result, counts: [...counts], activeLine: L('return the largest total'), result, message: `Maximum grid happiness: ${result}.` })
  return { input: { m, n, introverts, extroverts }, result, frames }
}

export const python = `def max_grid_happiness(m, n, introverts, extroverts):
    EMPTY, INTRO, EXTRO = 0, 1, 2

    def base(s):
        return 120 if s == INTRO else 40 if s == EXTRO else 0

    def effect(s):
        return -30 if s == INTRO else 20 if s == EXTRO else 0

    states = {((0,) * n, 0, 0): 0}
    for r in range(m):
        for c in range(n):
            nxt = {}
            for (profile, intro, extro), score in states.items():
                for s in (EMPTY, INTRO, EXTRO):
                    if s == INTRO and intro >= introverts:
                        continue
                    if s == EXTRO and extro >= extroverts:
                        continue
                    up = profile[c]
                    left = profile[c - 1] if c > 0 else EMPTY
                    gain = base(s)
                    if s != EMPTY:
                        if up != EMPTY:
                            gain += effect(s) + effect(up)
                        if left != EMPTY:
                            gain += effect(s) + effect(left)
                    new_profile = profile[:c] + (s,) + profile[c + 1:]
                    key = (new_profile, intro + (s == INTRO), extro + (s == EXTRO))
                    value = score + gain
                    if key not in nxt or value > nxt[key]:
                        nxt[key] = value
            states = nxt
    return max(states.values())
`
