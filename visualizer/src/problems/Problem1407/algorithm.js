// Knowledge-derived teaching model. Sample tables and wording are original.
const NAME = /^[A-Za-z]{1,12}$/

export const code = `select u.name, coalesce(sum(r.distance), 0) as travelled_distance
from Users u
left join Rides r on r.user_id = u.id
group by u.id, u.name
order by travelled_distance desc, u.name asc`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`No SQL line contains "${s}"`)
  return index + 1
}

export const python = `import pandas as pd

def top_travellers(users, rides):
    totals = rides.groupby('user_id')['distance'].sum()
    users = users.assign(travelled_distance=users['id'].map(totals).fillna(0))
    ranked = users.sort_values(['travelled_distance', 'name'], ascending=[False, True])
    return ranked[['name', 'travelled_distance']]
`

const pythonLines = python.split('\n')
const P = s => {
  const index = pythonLines.findIndex(t => t.includes(s))
  if (index < 0) throw new Error(`No Python line contains "${s}"`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with users and rides.')
  const { users, rides } = input
  if (!Array.isArray(users) || users.length < 1 || users.length > 8) throw new Error('users has 1 to 8 rows.')
  if (!Array.isArray(rides) || rides.length > 12) throw new Error('rides has at most 12 rows.')
  const userIds = new Set()
  for (const u of users) {
    if (!Number.isInteger(u.id) || typeof u.name !== 'string' || !NAME.test(u.name)) throw new Error('Each user needs an integer id and a letters-only name.')
    if (userIds.has(u.id)) throw new Error('User ids must be unique.')
    userIds.add(u.id)
  }
  const rideIds = new Set()
  for (const r of rides) {
    if (!Number.isInteger(r.id) || rideIds.has(r.id)) throw new Error('Ride ids must be unique integers.')
    rideIds.add(r.id)
    if (!userIds.has(r.user_id)) throw new Error('Each ride must belong to a listed user.')
    if (!Number.isInteger(r.distance) || r.distance < 0 || r.distance > 1000) throw new Error('distance is an integer from 0 to 1000 in this visualization.')
  }
  return {
    users: users.map(({ id, name }) => ({ id, name })),
    rides: rides.map(({ id, user_id, distance }) => ({ id, user_id, distance })),
  }
}

const frame = (phase, activeLine, pythonLine, message, columns, rows) => ({
  phase, activeLine, pythonLine, message, columns, rows: rows.map(row => ({ ...row })),
})

const byTotalThenName = (a, b) => (b.travelled_distance - a.travelled_distance) || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0)

export function buildTrace({ users, rides }) {
  const frames = []
  frames.push(frame('load', L('from Users u'), P('def top_travellers'),
    'Load the Users table.', ['id', 'name'], users))

  const joined = []
  for (const u of users) {
    const mine = rides.filter(r => r.user_id === u.id)
    if (mine.length === 0) joined.push({ name: u.name, distance: null })
    for (const r of mine) joined.push({ name: u.name, distance: r.distance })
  }
  frames.push(frame('join', L('left join Rides'), P('users = users.assign'),
    'Attach each ride to its user. A user with no rides keeps one row with a null distance.', ['name', 'distance'], joined))

  const totals = users.map(u => ({
    name: u.name,
    travelled_distance: rides.filter(r => r.user_id === u.id).reduce((sum, r) => sum + r.distance, 0),
  }))
  frames.push(frame('group', L('group by u.id'), P('totals = rides'),
    'Sum each user\'s distance. Missing rides count as zero through coalesce.', ['name', 'travelled_distance'], totals))

  const ordered = [...totals].sort(byTotalThenName)
  frames.push(frame('order', L('order by travelled_distance'), P('ranked = users.sort_values'),
    'Sort by total distance from largest to smallest, breaking ties by name.', ['name', 'travelled_distance'], ordered))

  frames.push(frame('output', L('select u.name'), P('return ranked'),
    'Result: name and travelled_distance for every user.', ['name', 'travelled_distance'], ordered))

  return { input: { users, rides }, result: ordered.map(row => ({ ...row })), frames }
}
