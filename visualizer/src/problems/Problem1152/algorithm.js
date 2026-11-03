const NAME = /^[a-z]+$/

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.visits) || input.visits.length < 3 || input.visits.length > 30) throw new Error('Use an object with visits, 3 to 30 entries.')
  for (const v of input.visits) {
    if (!Array.isArray(v) || v.length !== 3 || typeof v[0] !== 'string' || !NAME.test(v[0]) || !Number.isInteger(v[1]) || typeof v[2] !== 'string' || !NAME.test(v[2])) {
      throw new Error('Each visit is [user, time, site] with lowercase names and an integer time.')
    }
  }
  return input
}

export function buildTrace({ visits }) {
  const sorted = visits.map((v, i) => ({ user: v[0], time: v[1], site: v[2], i })).sort((a, b) => a.time - b.time || a.i - b.i)
  const byUser = new Map()
  for (const v of sorted) {
    if (!byUser.has(v.user)) byUser.set(v.user, [])
    byUser.get(v.user).push(v.site)
  }
  const counts = new Map()
  const state = () => [...counts].map(([key, c]) => `${key.split(',').join(' then ')}: ${c} user${c === 1 ? '' : 's'}`)
  const frames = [{ phase: 'sort', pythonLine: PL('visits.sort'), activeLine: L('sort the visits by time'), state: [], message: 'Order every visit by time.' }]
  for (const [user, sites] of byUser) {
    const seen = new Set()
    for (let i = 0; i < sites.length; i++) for (let j = i + 1; j < sites.length; j++) for (let k = j + 1; k < sites.length; k++) {
      seen.add([sites[i], sites[j], sites[k]].join(','))
    }
    for (const key of seen) counts.set(key, (counts.get(key) || 0) + 1)
    frames.push({ phase: 'user', pythonLine: PL('for user, sites'), activeLine: L('count it for the pattern'), state: state(), message: `${user} has ${seen.size} distinct pattern${seen.size === 1 ? '' : 's'}.` })
  }
  let best = null
  for (const [key, c] of counts) if (!best || c > best.c || (c === best.c && key < best.key)) best = { key, c }
  if (!best) throw new Error('No user visited three sites, so there is no pattern.')
  frames.push({ phase: 'done', pythonLine: PL('return list(best)'), activeLine: L('return that pattern'), state: [...state(), `best: ${best.key}`], message: `${best.key.split(',').join(' then ')} is shared by the most users.` })
  return { input: { visits }, result: best.key.split(','), frames }
}

export const code = `most shared three site pattern
  sort the visits by time
  group the sites of each user in time order
  for each user
    collect every distinct three site subsequence once
    count it for the pattern
  pick the highest count, breaking ties by the smaller pattern
  return that pattern`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def most_visited_pattern(visits):
    visits.sort(key=lambda v: v[1])
    sites_by_user = {}
    for user, _time, site in visits:
        sites_by_user.setdefault(user, []).append(site)
    counts = {}
    for user, sites in sites_by_user.items():
        seen = set()
        for i in range(len(sites)):
            for j in range(i + 1, len(sites)):
                for k in range(j + 1, len(sites)):
                    seen.add((sites[i], sites[j], sites[k]))
        for pattern in seen:
            counts[pattern] = counts.get(pattern, 0) + 1
    best = min(counts, key=lambda p: (-counts[p], p))
    return list(best)
`
const PL = s => python.split('\n').findIndex(l => l.includes(s)) + 1
