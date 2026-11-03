const EMAIL = /^[A-Za-z0-9.+_-]+@[A-Za-z0-9.-]+$/

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with an emails list.')
  const { emails } = input
  if (!Array.isArray(emails) || emails.length < 1 || emails.length > 12) throw new Error('emails lists 1 to 12 addresses.')
  for (const email of emails) {
    if (typeof email !== 'string' || !EMAIL.test(email) || email.split('@').length !== 2) throw new Error('Each email has one @ with a local part and a domain.')
  }
  return { emails }
}

// Local part: lowercase, drop dots, and cut at the first plus. Domain: lowercase only.
export function normalize(email) {
  const at = email.indexOf('@')
  const local = email.slice(0, at).toLowerCase().split('+')[0].replaceAll('.', '')
  const domain = email.slice(at + 1).toLowerCase()
  return { local, domain, key: `${local}@${domain}` }
}

export function buildTrace({ emails }) {
  const frames = []
  const groups = new Map()
  const snap = extra => ({ groups: [...groups.entries()].map(([key, count]) => ({ key, count })), ...extra })
  frames.push(snap({ pythonLine: PY('seen = set()'), phase: 'start', activeLine: L('seen = empty set'), index: -1, raw: null, local: null, domain: null, key: null, isNew: null, message: `Normalize ${emails.length} address${emails.length === 1 ? '' : 'es'}.` }))
  emails.forEach((email, index) => {
    const at = email.indexOf('@')
    const rawLocal = email.slice(0, at).toLowerCase()
    frames.push(snap({ pythonLine: PY('for email in emails'), phase: 'read', activeLine: L('for each address'), index, raw: email, local: rawLocal, domain: email.slice(at + 1).toLowerCase(), key: null, isNew: null, message: `Read ${email}; lowercase it first.` }))
    const { local, domain, key } = normalize(email)
    frames.push(snap({ pythonLine: PY('local = local.split'), phase: 'strip', activeLine: L('cut the local part at the first plus'), index, raw: email, local, domain, key: null, isNew: null, message: `Local part becomes ${local}; the domain ${domain} keeps its dots.` }))
    const isNew = !groups.has(key)
    groups.set(key, (groups.get(key) || 0) + 1)
    frames.push(snap({ pythonLine: PY('seen.add'), phase: isNew ? 'new' : 'seen', activeLine: L('add local at domain'), index, raw: email, local, domain, key, isNew, message: isNew ? `${key} is a new group.` : `${key} is already a group; no new count.` }))
  })
  frames.push(snap({ pythonLine: PY('return len(seen)'), phase: 'done', activeLine: L('return the number of keys'), index: -1, raw: null, local: null, domain: null, key: null, isNew: null, message: `${groups.size} distinct normalized address${groups.size === 1 ? '' : 'es'}.` }))
  return { input: { emails }, result: groups.size, frames }
}

export const code = `count distinct normalized email addresses
  seen = empty set
  for each address
    lowercase the address
    remove dots from the local part
    cut the local part at the first plus
    add local at domain to seen
  return the number of keys in seen`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def unique_email_groups(emails):
    seen = set()
    for email in emails:
        local, domain = email.lower().split('@')
        local = local.split('+')[0].replace('.', '')
        seen.add(local + '@' + domain)
    return len(seen)
`

const PY = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}
