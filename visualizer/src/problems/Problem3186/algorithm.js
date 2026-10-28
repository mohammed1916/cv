export function parseInput(text) {
  const power = JSON.parse(text)
  if (!Array.isArray(power) || power.length < 1 || power.length > 10) throw new Error('Use an array of 1 to 10 spell powers.')
  if (power.some(v => !Number.isInteger(v) || v < 1 || v > 10)) throw new Error('Spell powers are integers from 1 to 10.')
  return power
}

export function buildTrace(power) {
  // total[v]: damage from every spell with power v. Casting power v rules out powers v-1 and v-2 and v+1 and v+2.
  const totals = new Map()
  for (const p of power) totals.set(p, (totals.get(p) ?? 0) + p)
  const vals = [...totals.keys()].sort((a, b) => a - b)
  const m = vals.length
  const best = Array(m + 1).fill(0)
  const frames = [{ phase: 'start', activeLine: L('set best[0] to 0'), i: 0, p: null, best: [...best], vals, message: 'No distinct power used yet, so the best total is 0.' }]
  for (let i = 1; i <= m; i++) {
    const v = vals[i - 1]
    let p = 0
    while (p < m && vals[p] <= v - 3) p++
    best[i] = Math.max(best[i - 1], totals.get(v) + best[p])
    frames.push({ phase: 'power', activeLine: L('keep the better'), i, p, best: [...best], vals, message: `Power ${v}: skip it gives ${best[i - 1]}; cast it with the first ${p} distinct powers gives ${totals.get(v) + best[p]}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best[m]'), i: m, p: null, best: [...best], vals, message: `The maximum total damage is ${best[m]}.` })
  return { input: power, result: best[m], frames, vals }
}

export const code = `maximum total damage from casting each spell at most once:
  add up the damage of each distinct power value
  sort the distinct powers from smallest to largest
  set best[0] to 0
  for each distinct power i from 1 to m:
    find p, how many distinct powers are at most power i - 3
    keep the better of skipping power i and casting it with the first p powers
  return best[m]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximum_total_damage(power):
    totals = {}
    for p in power:
        totals[p] = totals.get(p, 0) + p
    vals = sorted(totals)
    m = len(vals)
    best = [0] * (m + 1)
    for i in range(1, m + 1):
        v = vals[i - 1]
        p = 0
        while p < m and vals[p] <= v - 3:
            p += 1
        best[i] = max(best[i - 1], totals[v] + best[p])
    return best[m]
`
