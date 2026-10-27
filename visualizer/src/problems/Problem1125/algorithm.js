export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with the keys req_skills and people.')
  const { req_skills: skills, people } = input
  if (!Array.isArray(skills) || skills.length < 1 || skills.length > 6 || skills.some(s => typeof s !== 'string' || !/^[a-z]{1,8}$/.test(s)) || new Set(skills).size !== skills.length) {
    throw new Error('req_skills is 1 to 6 distinct lowercase skill names.')
  }
  if (!Array.isArray(people) || people.length < 1 || people.length > 8) throw new Error('people needs 1 to 8 skill lists.')
  const covered = new Set()
  people.forEach((list, i) => {
    if (!Array.isArray(list) || list.some(s => !skills.includes(s))) throw new Error(`people[${i}] may only use required skills.`)
    list.forEach(s => covered.add(s))
  })
  if (covered.size !== skills.length) throw new Error('Every required skill must be held by at least one person.')
  return { req_skills: skills, people }
}

export function buildTrace(input) {
  const { req_skills: skills, people } = input
  const bit = new Map(skills.map((s, i) => [s, i]))
  const full = (1 << skills.length) - 1
  const dp = new Map([[0, []]])
  const frames = []
  let person = -1
  let changed = []
  const snap = (phase, activeLine, message) => frames.push({
    phase, activeLine, person, changed: [...changed], teams: [...dp.entries()].map(([m, t]) => [m, t.length]), message,
  })

  snap('start', L('start with the empty skill set'), 'The empty set of skills is covered by an empty team.')
  snap('map', L('map each required skill'), `Skills get bits: ${skills.map((s, i) => `${s}=${i}`).join(', ')}.`)
  for (let p = 0; p < people.length; p++) {
    person = p
    changed = []
    let pm = 0
    for (const s of people[p]) pm |= 1 << bit.get(s)
    snap('person', L('for each person p'), `Person ${p} holds mask ${pm.toString(2).padStart(skills.length, '0')}.`)
    for (const [mask, team] of [...dp.entries()]) {
      const t = mask | pm
      if (!dp.has(t) || dp.get(t).length > team.length + 1) {
        dp.set(t, [...team, p])
        changed.push(t)
        snap('update', L('if t is new'), `Covered set ${t.toString(2).padStart(skills.length, '0')} is now reached with ${team.length + 1} people.`)
      }
    }
  }
  person = -1
  changed = []
  const team = [...dp.get(full)].sort((a, b) => a - b)
  snap('done', L('return the team'), `Smallest team of ${team.length}: [${team.join(', ')}].`)
  return { input, result: team, frames }
}

export const code = `map each required skill to a bit position
start with the empty skill set covered by an empty team
for each person p in order
  let pm be the skill bits that person p holds
  for each covered set s and its team, taken before this person
    let t be s combined with pm
    if t is new, or its team is larger than this team plus p, store this team plus p for t
return the team that covers every skill, sorted by index`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def smallest_team(req_skills, people):
    bit = {skill: i for i, skill in enumerate(req_skills)}
    full = (1 << len(req_skills)) - 1
    dp = {0: []}
    for p, skills in enumerate(people):
        pm = 0
        for s in skills:
            pm |= 1 << bit[s]
        for mask, team in list(dp.items()):
            t = mask | pm
            if t not in dp or len(dp[t]) > len(team) + 1:
                dp[t] = team + [p]
    return sorted(dp[full])
`
