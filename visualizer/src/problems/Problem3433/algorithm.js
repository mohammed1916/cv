const OFFLINE_FOR = 60

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object with numberOfUsers and events.')
  const { numberOfUsers, events } = input
  if (!Number.isInteger(numberOfUsers) || numberOfUsers < 1 || numberOfUsers > 10) throw new Error('numberOfUsers is an integer from 1 to 10.')
  if (!Array.isArray(events) || events.length < 1 || events.length > 20) throw new Error('Use 1 to 20 events.')
  for (const [i, ev] of events.entries()) {
    if (!Array.isArray(ev) || ev.length !== 3) throw new Error(`Event ${i} must be [type, timestamp, value].`)
    const [kind, time, value] = ev
    if (typeof time !== 'string' || !/^[1-9][0-9]{0,2}$/.test(time)) throw new Error(`Event ${i} timestamp must be a string of an integer from 1 to 999.`)
    if (kind === 'OFFLINE') {
      if (typeof value !== 'string' || !/^[0-9]+$/.test(value) || Number(value) >= numberOfUsers) throw new Error(`Event ${i} OFFLINE value must be a user id below numberOfUsers.`)
    } else if (kind === 'MESSAGE') {
      if (typeof value !== 'string') throw new Error(`Event ${i} MESSAGE value must be a string.`)
      const tokens = value.split(' ')
      const ok = (tokens.length === 1 && (tokens[0] === 'ALL' || tokens[0] === 'HERE')) ||
        tokens.every(t => /^id[0-9]+$/.test(t) && Number(t.slice(2)) < numberOfUsers)
      if (!ok) throw new Error(`Event ${i} MESSAGE must be ALL, HERE, or ids like id0 separated by single spaces.`)
    } else {
      throw new Error(`Event ${i} type must be MESSAGE or OFFLINE.`)
    }
  }
  return { numberOfUsers, events }
}

export function buildTrace(input) {
  const { numberOfUsers, events } = input
  const counts = Array(numberOfUsers).fill(0)
  const backOnline = Array(numberOfUsers).fill(0)
  const order = [...events].sort((a, b) => Number(a[1]) - Number(b[1]) || rank(a[0]) - rank(b[0]))
  const frames = [{ phase: 'start', activeLine: L('counts = zero'), counts: [...counts], event: null, message: 'Everyone starts online with no mentions.' }]
  for (const [kind, text, value] of order) {
    const time = Number(text)
    if (kind === 'OFFLINE') {
      const u = Number(value)
      backOnline[u] = time + OFFLINE_FOR
      frames.push({ phase: 'offline', activeLine: L('if it is OFFLINE'), counts: [...counts], event: [kind, text, value], message: `User ${u} goes offline at ${time} and is back at ${time + OFFLINE_FOR}.` })
    } else {
      let targets
      let reason
      if (value === 'ALL') {
        targets = counts.map((_, u) => u)
        reason = 'ALL reaches every user'
      } else if (value === 'HERE') {
        targets = counts.map((_, u) => u).filter(u => backOnline[u] <= time)
        reason = 'HERE reaches users online now'
      } else {
        targets = value.split(' ').map(t => Number(t.slice(2)))
        reason = 'each id is counted, even when offline'
      }
      for (const u of targets) counts[u] += 1
      frames.push({ phase: 'message', activeLine: L('if the string is ALL'), counts: [...counts], event: [kind, text, value], message: `Message at ${time} (${reason}): ${targets.length} mention(s).` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return counts'), counts: [...counts], event: null, message: `Mentions per user: [${counts.join(', ')}].` })
  return { input, result: counts, frames }
}

// OFFLINE events are handled before MESSAGE events that share a timestamp.
const rank = kind => (kind === 'OFFLINE' ? 0 : 1)

export const code = `count mentions per user:
  counts = zero for every user
  back online[u] = 0 for every user, so everyone starts online
  sort events by time, with OFFLINE before MESSAGE at the same time
  for each event in order:
    if it is OFFLINE for user u then
      back online[u] = time + 60
    otherwise it is a MESSAGE:
      if the string is ALL then add 1 to every user
      if the string is HERE then add 1 to every user with back online <= time
      otherwise add 1 for each id named in the string
  return counts`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_mentions(numberOfUsers, events):
    counts = [0] * numberOfUsers
    back_online = [0] * numberOfUsers
    order = sorted(events, key=lambda e: (int(e[1]), 0 if e[0] == 'OFFLINE' else 1))
    for kind, text, value in order:
        time = int(text)
        if kind == 'OFFLINE':
            back_online[int(value)] = time + 60
        elif value == 'ALL':
            for u in range(numberOfUsers):
                counts[u] += 1
        elif value == 'HERE':
            for u in range(numberOfUsers):
                if back_online[u] <= time:
                    counts[u] += 1
        else:
            for token in value.split(' '):
                counts[int(token[2:])] += 1
    return counts
`
