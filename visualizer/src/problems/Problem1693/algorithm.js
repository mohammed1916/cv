// Daily leads and partners: group the sales by date and product, then count distinct leads and partners.
export const sql = `SELECT date_id, make_name,
  COUNT(DISTINCT lead_id) AS unique_leads,
  COUNT(DISTINCT partner_id) AS unique_partners
FROM DailySales
GROUP BY date_id, make_name;`

const JS_LINES = [
  { text: 'const groups = new Map()', py: 'groups = {}' },
  { text: 'for (const row of rows) {', py: 'for row in rows' },
  { text: 'const key = `${row.date_id}|${row.make_name}`', py: 'key = (row' },
  { text: 'if (!groups.has(key)) groups.set(key, { leads: new Set(), partners: new Set() })', py: 'groups.setdefault' },
  { text: 'groups.get(key).leads.add(row.lead_id)', py: 'leads.add' },
  { text: 'groups.get(key).partners.add(row.partner_id)', py: 'partners.add' },
  { text: '}', py: null },
  { text: 'return [...groups].map(([key, g]) => ({ key, unique_leads: g.leads.size, unique_partners: g.partners.size }))', py: 'return [' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `def dailyLeadsAndPartners(rows):
    groups = {}
    for row in rows:
        key = (row['date_id'], row['make_name'])
        leads, partners = groups.setdefault(key, (set(), set()))
        leads.add(row['lead_id'])
        partners.add(row['partner_id'])
    return [{'date_id': d, 'make_name': m, 'unique_leads': len(l), 'unique_partners': len(p)}
            for (d, m), (l, p) in groups.items()]
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return [')]))

export const phases = [
  { id: 'from', label: 'FROM', description: 'Read each sale row from DailySales.' },
  { id: 'group', label: 'GROUP BY', description: 'A new (date, product) pair starts a new group.' },
  { id: 'aggregate', label: 'COUNT DISTINCT', description: 'Each row adds its lead and partner to the group sets; repeats do not count twice.' },
  { id: 'done', label: 'Output', description: 'One output row per group: the sizes of the two sets.' },
]

export const examples = [
  { label: 'Repeated lead', input: '[{"date_id":"2026-01-01","make_name":"pear","lead_id":1,"partner_id":8},{"date_id":"2026-01-01","make_name":"pear","lead_id":1,"partner_id":9},{"date_id":"2026-01-01","make_name":"plum","lead_id":2,"partner_id":8},{"date_id":"2026-01-02","make_name":"pear","lead_id":3,"partner_id":9}]' },
  { label: 'Single sale', input: '[{"date_id":"2026-03-05","make_name":"fig","lead_id":7,"partner_id":4}]' },
]

export const complexity = 'O(n) time and O(n) space for n sale rows, counting distinct values with sets per group.'

export function parseInput(text) {
  const rows = JSON.parse(text)
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 30) throw new Error('Use a JSON array of 1 to 30 sale rows (visual cap).')
  for (const row of rows) {
    if (typeof row.date_id !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(row.date_id)) throw new Error('date_id is a date such as 2026-01-31.')
    if (typeof row.make_name !== 'string' || !/^[a-z]+$/.test(row.make_name)) throw new Error('make_name uses lowercase letters only.')
    if (!Number.isInteger(row.lead_id) || !Number.isInteger(row.partner_id)) throw new Error('lead_id and partner_id are integers.')
  }
  return rows
}

export function buildTrace(rows) {
  const frames = []
  const groups = new Map()
  const snap = extra => ({ groups: [...groups.values()].map(g => ({ date: g.date_id, make: g.make_name, leads: [...g.leads], partners: [...g.partners] })), ...extra })
  rows.forEach((row, i) => {
    frames.push({ phase: 'from', activeLine: 2, index: i, message: `Row ${i + 1}: ${row.date_id}, ${row.make_name}, lead ${row.lead_id}, partner ${row.partner_id}.`, snapshot: snap({}) })
    const key = `${row.date_id}|${row.make_name}`
    if (!groups.has(key)) {
      groups.set(key, { date_id: row.date_id, make_name: row.make_name, leads: new Set(), partners: new Set() })
      frames.push({ phase: 'group', activeLine: 4, index: i, message: `New group (${row.date_id}, ${row.make_name}).`, snapshot: snap({ current: key }) })
    }
    const g = groups.get(key)
    g.leads.add(row.lead_id)
    g.partners.add(row.partner_id)
    frames.push({ phase: 'aggregate', activeLine: 5, index: i, message: `Lead ${row.lead_id} and partner ${row.partner_id} recorded for (${row.date_id}, ${row.make_name}).`, snapshot: snap({ current: key }) })
  })
  const result = [...groups.values()].map(g => ({ date_id: g.date_id, make_name: g.make_name, unique_leads: g.leads.size, unique_partners: g.partners.size }))
  frames.push({ phase: 'done', activeLine: 8, index: -1, result, message: `${result.length} output rows, one per group.`, snapshot: snap({ result }) })
  return { input: rows, result, frames }
}
