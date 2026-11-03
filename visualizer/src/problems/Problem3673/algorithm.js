const ID = /^[A-Z0-9]{1,6}$/

export const phases = [
  { id: 'start', label: 'Setup', description: 'Read the reference time and the idle threshold.' },
  { id: 'scan', label: 'Scan', description: 'Visit the next session row.' },
  { id: 'check', label: 'Check', description: 'Is the session open and idle long enough?' },
  { id: 'match', label: 'Zombie', description: 'The row satisfies every condition.' },
  { id: 'skip', label: 'Skip', description: 'The row fails a condition.' },
  { id: 'done', label: 'Result', description: 'Return the zombie ids in order.' },
]

export const sql = `SELECT session_id
FROM sessions
WHERE is_open = 1
  AND :now - last_active >= :idle
ORDER BY session_id;`

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with now, idle and sessions.')
  const { now, idle, sessions } = input
  if (!Number.isInteger(now) || now < 0 || now > 1439) throw new Error('now is a minute of the day from 0 to 1439.')
  if (!Number.isInteger(idle) || idle < 1 || idle > 240) throw new Error('idle is a whole number of minutes from 1 to 240.')
  if (!Array.isArray(sessions) || sessions.length < 1 || sessions.length > 8) throw new Error('sessions has 1 to 8 rows.')
  const seen = new Set()
  for (const row of sessions) {
    if (!row || typeof row !== 'object') throw new Error('Each session is an object.')
    const { session_id: id, last_active: last, is_open: open } = row
    if (typeof id !== 'string' || !ID.test(id)) throw new Error('session_id is 1 to 6 uppercase letters or digits.')
    if (seen.has(id)) throw new Error(`session_id ${id} appears twice.`)
    seen.add(id)
    if (!Number.isInteger(last) || last < 0 || last > now) throw new Error('last_active is a minute from 0 up to now.')
    if (typeof open !== 'boolean') throw new Error('is_open is true or false.')
  }
  return { now, idle, sessions: sessions.map(({ session_id, last_active, is_open }) => ({ session_id, last_active, is_open })) }
}

export function buildTrace({ now, idle, sessions }) {
  const frames = []
  const zombies = []
  frames.push({ pythonLine: L_PY('result = []'), phase: 'start', activeLine: L('start with no zombies'), row: null, result: [], message: `Reference minute ${now}, idle threshold ${idle} minutes.` })
  for (const row of sessions) {
    const idleFor = now - row.last_active
    const snapshot = (zombie) => ({ session_id: row.session_id, last_active: row.last_active, is_open: row.is_open, idle_for: idleFor, zombie })
    frames.push({ pythonLine: L_PY('for session_id'), phase: 'scan', activeLine: L('for each session row'), row: snapshot(null), result: [...zombies], message: `Read ${row.session_id}: idle for ${idleFor} minutes.` })
    const zombie = row.is_open && idleFor >= idle
    frames.push({ pythonLine: L_PY('if is_open and'), phase: 'check', activeLine: L('if the row is open and idle'), row: snapshot(zombie), result: [...zombies], message: `${row.is_open ? 'Open' : 'Closed'}; ${idleFor} is ${idleFor >= idle ? 'at least' : 'below'} ${idle}.` })
    if (zombie) {
      zombies.push(row.session_id)
      frames.push({ pythonLine: L_PY('result.append'), phase: 'match', activeLine: L('add the session id'), row: snapshot(true), result: [...zombies], message: `${row.session_id} is a zombie.` })
    } else {
      const reason = row.is_open ? `idle ${idleFor} is below ${idle}.` : 'the session is already closed.'
      frames.push({ pythonLine: L_PY('if is_open and'), phase: 'skip', activeLine: L('if the row is open and idle'), row: snapshot(false), result: [...zombies], message: `${row.session_id} is not a zombie: ${reason}` })
    }
  }
  frames.push({ pythonLine: L_PY('return result'), phase: 'done', activeLine: L('return the zombie ids'), row: null, result: [...zombies], message: zombies.length ? `${zombies.length} zombie session${zombies.length === 1 ? '' : 's'} found.` : 'No zombie sessions.' })
  return { input: { now, idle, sessions }, result: zombies, frames }
}

export const code = `list the open sessions idle for at least the threshold
  start with no zombies
  for each session row
    compute idle = now minus last_active
    if the row is open and idle is at least the threshold
      add the session id to the zombies
  return the zombie ids in order`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing code line: ${s}`)
  return index + 1
}

export const python = `def find_zombie_sessions(now, idle, sessions):
    result = []
    for session_id, last_active, is_open in sessions:
        idle_for = now - last_active
        if is_open and idle_for >= idle:
            result.append(session_id)
    return result
`
const PY_LINES = python.split('\n')
function L_PY(s) {
  const index = PY_LINES.findIndex(c => c.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}
