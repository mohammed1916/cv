const line = (text) => text.split('\n').map((t, index) => ({ line: index + 1, text: t }))

export const code = line(`find the time when the last potion leaves the last wizard
  prefix[i] = skill[0] + ... + skill[i]
  start[0] = 0
  for each potion j from 1 to m minus 1
    gap = largest prefix[i] * mana[j-1] minus prefix[i-1] * mana[j]
    start[j] = start[j-1] + gap
  return start[m-1] + prefix[n-1] * mana[m-1]`)

const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def brew_time(skill, mana):
    prefix = []
    total = 0
    for x in skill:
        total += x
        prefix.append(total)
    start = [0]
    for j in range(1, len(mana)):
        gap = max(prefix[i] * mana[j - 1] - (prefix[i - 1] if i else 0) * mana[j] for i in range(len(skill)))
        start.append(start[-1] + gap)
    return start[-1] + prefix[-1] * mana[-1]`

const BOUND = 12
const VALUE = /^\d+$/

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with skill and mana arrays.')
  const { skill, mana } = input
  const valid = list => Array.isArray(list) && list.length >= 1 && list.length <= BOUND
    && list.every(v => Number.isInteger(v) && v >= 1 && v <= 20 && VALUE.test(String(v)))
  if (!valid(skill)) throw new Error(`skill has 1 to ${BOUND} integers from 1 to 20.`)
  if (!valid(mana)) throw new Error(`mana has 1 to ${BOUND} integers from 1 to 20.`)
  return { skill, mana }
}

// Knowledge-derived model: potion j may start once, for every wizard i, the wizard has finished
// the previous potion. Writing S_i for the prefix sum of skill, that gives
// start[j] = start[j-1] + max over i of (S_i * mana[j-1] - S_(i-1) * mana[j]).
export function buildTrace({ skill, mana }) {
  const n = skill.length
  const m = mana.length
  const prefix = []
  let running = 0
  for (const v of skill) { running += v; prefix.push(running) }
  const before = i => (i === 0 ? 0 : prefix[i - 1])
  const frames = []
  const start = [0]
  frames.push({ pythonLine: 5, phase: 'prefix', activeLine: L('prefix[i] ='), prefix, start: [...start], potion: -1, wizard: -1, candidate: null, result: null,
    message: `Prefix sums of skill are ${prefix.join(', ')}.` })
  for (let j = 1; j < m; j++) {
    let gap = -Infinity
    for (let i = 0; i < n; i++) {
      const candidate = prefix[i] * mana[j - 1] - before(i) * mana[j]
      gap = Math.max(gap, candidate)
      frames.push({ pythonLine: 9, phase: 'gap', activeLine: L('gap ='), prefix, start: [...start], potion: j, wizard: i, candidate, result: null,
        message: `Potion ${j}, wizard ${i}: ${prefix[i]} * ${mana[j - 1]} - ${before(i)} * ${mana[j]} = ${candidate}. Best gap so far ${gap}.` })
    }
    start.push(start[j - 1] + gap)
    frames.push({ pythonLine: 10, phase: 'start', activeLine: L('start[j] ='), prefix, start: [...start], potion: j, wizard: -1, candidate: gap, result: null,
      message: `Potion ${j} starts at ${start[j]} after adding the gap ${gap}.` })
  }
  const result = start[m - 1] + prefix[n - 1] * mana[m - 1]
  frames.push({ pythonLine: 11, phase: 'done', activeLine: L('return start'), prefix, start: [...start], potion: m - 1, wizard: n - 1, candidate: null, result,
    message: `The last potion needs ${prefix[n - 1]} * ${mana[m - 1]} more time after it starts, so the total is ${result}.` })
  return { input: { skill, mana }, frames, result }
}
