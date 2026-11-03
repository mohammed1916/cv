// Teaching model derived from general backtracking knowledge; not verified against the official statement.
const MAX_TEAMS = 4

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n.')
  const { n } = input
  if (!Number.isInteger(n) || n < 2 || n > MAX_TEAMS) throw new Error(`n is an integer from 2 to ${MAX_TEAMS} in this visual.`)
  return { n }
}

export function buildTrace({ n }) {
  const matches = []
  for (let home = 0; home < n; home++) {
    for (let away = 0; away < n; away++) if (home !== away) matches.push([home, away])
  }
  const total = matches.length
  const used = Array(total).fill(false)
  const plan = []
  const frames = []
  const slots = () => Array.from({ length: total }, (_, i) => (i < plan.length ? `${plan[i][0]}-${plan[i][1]}` : '·'))
  let result = []

  const place = () => {
    if (plan.length === total) {
      result = plan.map(pair => pair.slice())
      frames.push({ pythonLine: 7, phase: 'found', activeLine: L('if all matches are placed'), at: plan.length - 1, slots: slots(), ok: true, message: 'Every ordered pair is placed and no team plays on consecutive days.' })
      return true
    }
    const prev = plan[plan.length - 1]
    for (let m = 0; m < total; m++) {
      if (used[m]) continue
      const [home, away] = matches[m]
      if (prev && [prev[0], prev[1]].some(team => team === home || team === away)) {
        frames.push({ pythonLine: 12, phase: 'skip', activeLine: L('if it shares a team'), at: plan.length, slots: slots(), ok: false, message: `${home}-${away} touches yesterday's teams; skip it.` })
        continue
      }
      used[m] = true
      plan.push([home, away])
      frames.push({ pythonLine: 14, phase: 'place', activeLine: L('place it and recurse'), at: plan.length - 1, slots: slots(), ok: null, message: `Day ${plan.length - 1}: ${home} hosts ${away}.` })
      if (place()) return true
      plan.pop()
      used[m] = false
      frames.push({ pythonLine: 18, phase: 'backtrack', activeLine: L('undo the placement'), at: plan.length, slots: slots(), ok: false, message: `Dead end; undo ${home}-${away}.` })
    }
    return false
  }

  const found = place()
  frames.push({ pythonLine: 21, phase: 'done', activeLine: L('return none'), at: -1, slots: slots(), ok: found, message: found ? 'A schedule exists.' : 'No schedule exists, so return an empty list.' })
  return { input: { n }, result: found ? result : [], frames }
}

export const code = `schedule every ordered pair of distinct teams once
  list every ordered pair (home, away) with home not equal to away
  define place() that fills the next day
  if all matches are placed then return the plan
  for each unused pair
    if it shares a team with the previous day then skip it
    place it and recurse
    undo the placement when recursion fails
  return none`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def generate_schedule(n):
    matches = [(h, a) for h in range(n) for a in range(n) if h != a]
    used = [False] * len(matches)
    plan = []
    def dfs():
        if len(plan) == len(matches):
            return True
        prev = plan[-1] if plan else None
        for m, (h, a) in enumerate(matches):
            if used[m]:
                continue
            if prev and len({prev[0], prev[1]} & {h, a}) > 0:
                continue
            used[m] = True
            plan.append((h, a))
            if dfs():
                return True
            plan.pop()
            used[m] = False
        return False
    return plan if dfs() else []
`
