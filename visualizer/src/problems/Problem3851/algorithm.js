export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with k, span and requests.')
  const { k, span, requests } = input
  if (!Number.isInteger(k) || k < 1 || k > 5) throw new Error('k is an integer from 1 to 5.')
  if (!Number.isInteger(span) || span < 0 || span > 20) throw new Error('span is an integer from 0 to 20.')
  if (!Array.isArray(requests) || requests.length < 1 || requests.length > 14) throw new Error('requests lists 1 to 14 [user, time] pairs.')
  for (const r of requests) {
    if (!Array.isArray(r) || r.length !== 2 || typeof r[0] !== 'string' || !/^[a-z]+$/.test(r[0]) || !Number.isInteger(r[1]) || r[1] < 0 || r[1] > 40) {
      throw new Error('Each request is [lowercase user, integer time from 0 to 40].')
    }
  }
  return { k, span, requests }
}

export function buildTrace({ k, span, requests }) {
  const frames = []
  const n = requests.length
  const status = Array(n).fill('open')
  const byUser = new Map()
  requests.forEach(([user], i) => {
    if (!byUser.has(user)) byUser.set(user, [])
    byUser.get(user).push(i)
  })
  const snap = (extra) => ({ status: status.slice(), ...extra })
  frames.push(snap({ pythonLine: PY('by_user = {}'), phase: 'start', activeLine: L('group the requests'), user: null, cur: -1, compare: -1, lo: null, hi: null, total: 0, message: `Group ${n} requests by user.` }))
  let total = 0
  for (const [user, idxs] of byUser) {
    const order = [...idxs].sort((a, b) => requests[a][1] - requests[b][1])
    const kept = []
    frames.push(snap({ pythonLine: PY('for user in by_user'), phase: 'user', activeLine: L('for each user'), user, cur: -1, compare: -1, lo: null, hi: null, total, message: `User ${user}: ${order.length} request${order.length === 1 ? '' : 's'} in time order.` }))
    for (const i of order) {
      const t = requests[i][1]
      const m = kept.length
      const compare = m >= k ? kept[m - k] : -1
      const drop = compare >= 0 && t - requests[compare][1] <= span
      status[i] = 'cur'
      const why = compare >= 0
        ? `${k} kept times end at ${requests[compare][1]}; the window [${t - span}, ${t}] would hold ${k + 1}.`
        : `Fewer than ${k} kept times, so t = ${t} fits.`
      frames.push(snap({ pythonLine: PY('for t in sorted'), phase: 'check', activeLine: L('for each time t'), user, cur: i, compare, lo: t - span, hi: t, total, message: `Check t = ${t}. ${why}` }))
      if (drop) {
        status[i] = 'drop'
        frames.push(snap({ pythonLine: PY('if len(kept) < k'), phase: 'drop', activeLine: L('drop t'), user, cur: i, compare, lo: t - span, hi: t, total, message: `Drop t = ${t} for ${user}.` }))
      } else {
        kept.push(i)
        status[i] = 'keep'
        total += 1
        frames.push(snap({ pythonLine: PY('kept.append(t)'), phase: 'keep', activeLine: L('keep t'), user, cur: i, compare, lo: t - span, hi: t, total, message: `Keep t = ${t} for ${user}; running total ${total}.` }))
      }
    }
  }
  frames.push(snap({ pythonLine: PY('return total'), phase: 'done', activeLine: L('return total'), user: null, cur: -1, compare: -1, lo: null, hi: null, total, message: `Largest number of retained requests: ${total}.` }))
  return { input: { k, span, requests }, result: total, frames }
}

export const code = `maximum requests kept under a per-user window limit
  group the requests by user
  total = 0
  for each user
    sort the user's times increasing
    kept = empty list
    for each time t in order
      if fewer than k kept times then keep t
      else if t minus the k-th last kept time is more than span then keep t
      else drop t
    add the number of kept times to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def max_requests(k, span, requests):
    by_user = {}
    for user, time in requests:
        by_user.setdefault(user, []).append(time)
    total = 0
    for user in by_user:
        kept = []
        for t in sorted(by_user[user]):
            if len(kept) < k or t - kept[len(kept) - k] > span:
                kept.append(t)
        total += len(kept)
    return total
`

const PY = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}
