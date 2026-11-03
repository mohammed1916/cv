export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with strengths and boosts.')
  const { strengths, boosts } = input
  if (!Array.isArray(strengths) || strengths.length < 1 || strengths.length > 8) throw new Error('strengths is a list of 1 to 8 monsters.')
  if (!strengths.every(v => Number.isInteger(v) && v >= 1 && v <= 30)) throw new Error('Each strength is an integer from 1 to 30.')
  if (!Array.isArray(boosts) || boosts.length > 5) throw new Error('boosts is a list of at most 5 ranges.')
  for (const b of boosts) {
    if (!Array.isArray(b) || b.length !== 3) throw new Error('Each boost is [left, right, value].')
    const [l, r, v] = b
    if (!Number.isInteger(l) || !Number.isInteger(r) || l < 0 || r < l || r >= strengths.length) throw new Error('Each boost range must lie inside the monsters.')
    if (!Number.isInteger(v) || v < 1 || v > 20) throw new Error('Each boost value is an integer from 1 to 20.')
  }
  return { strengths, boosts }
}

const lineOf = (list, text) => {
  const i = list.findIndex(c => c.text.includes(text))
  if (i < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return i + 1
}

export function buildTrace({ strengths, boosts }) {
  const frames = []
  const L = t => lineOf(code, t)
  const P = t => lineOf(PY, t)
  const n = strengths.length
  const bonusAt = i => boosts.reduce((sum, [l, r, v]) => (l <= i && i <= r ? sum + v : sum), 0)

  let low = 0
  let high = strengths.reduce((a, b) => a + b, 0)
  frames.push({ phase: 'start', activeLine: L('low = 0 and high'), pythonLine: P('low, high = 0'), low, high, probe: null, monster: -1, current: null, bonus: null, ok: null, result: null, message: `The answer lies between ${low} and ${high}.` })

  const can = start => {
    let current = start
    for (let i = 0; i < n; i++) {
      const bonus = bonusAt(i)
      const pass = current + bonus >= strengths[i]
      frames.push({ phase: pass ? 'monster' : 'fail', activeLine: L('if current plus bonus'), pythonLine: P('if current + bonus < need'), low, high, probe: start, monster: i, current, bonus, ok: pass, result: null, message: `Monster ${i + 1} needs ${strengths[i]}. With ${current} plus boost ${bonus}, it ${pass ? 'is defeated' : 'is not defeated'}.` })
      if (!pass) return false
      current = Math.max(0, current - strengths[i])
    }
    return true
  }

  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    frames.push({ phase: 'probe', activeLine: L('mid = (low + high)'), pythonLine: P('mid = (low + high)'), low, high, probe: mid, monster: -1, current: null, bonus: null, ok: null, result: null, message: `Test initial strength ${mid}.` })
    if (can(mid)) {
      high = mid
      frames.push({ phase: 'narrow', activeLine: L('if can defeat with mid'), pythonLine: P('high = mid'), low, high, probe: mid, monster: -1, current: null, bonus: null, ok: true, result: null, message: `${mid} defeats every monster, so the answer is at most ${mid}.` })
    } else {
      low = mid + 1
      frames.push({ phase: 'narrow', activeLine: L('else low = mid + 1'), pythonLine: P('low = mid + 1'), low, high, probe: mid, monster: -1, current: null, bonus: null, ok: false, result: null, message: `${mid} is not enough, so the answer is above ${mid}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return low'), pythonLine: P('return low'), low, high, probe: null, monster: -1, current: null, bonus: null, ok: null, result: low, message: `The least initial strength is ${low}.` })
  return { input: { strengths, boosts }, result: low, frames }
}

export const code = `least initial strength that defeats every monster
low = 0 and high = sum of all strengths
while low is less than high
  mid = (low + high) divided by 2 rounded down
  if can defeat with mid then high = mid
  else low = mid + 1
return low
can defeat with start:
  current = start
  for each monster i in order
    bonus = total boost value of the ranges that contain i
    if current plus bonus is less than strength[i] then return false
    current = max(0, current minus strength[i])
  return true`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def minimum_initial_strength(strengths, boosts):
    def can_defeat(start):
        current = start
        for i, need in enumerate(strengths):
            bonus = 0
            for l, r, v in boosts:
                if l <= i <= r:
                    bonus += v
            if current + bonus < need:
                return False
            current = max(0, current - need)
        return True
    low, high = 0, sum(strengths)
    while low < high:
        mid = (low + high) // 2
        if can_defeat(mid):
            high = mid
        else:
            low = mid + 1
    return low
`
const PY = python.split('\n').map((text, index) => ({ line: index + 1, text }))
