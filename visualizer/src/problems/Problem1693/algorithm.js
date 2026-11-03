export const phases = [
  { id: 'start', label: 'Input', description: 'Read the event rows; no group exists yet.' },
  { id: 'group', label: 'Find group', description: 'Each row belongs to exactly one (date, make) group, created when first seen.' },
  { id: 'add', label: 'Add distinct IDs', description: 'Each group keeps lead IDs and partner IDs in separate sets, so repeats count once.' },
  { id: 'done', label: 'Report', description: 'Report the set sizes for every group, ordered by date and make.' },
]

const MAX_ROWS = 200

export function parseInput(text) {
  let value
  try { value = JSON.parse(text) } catch { throw new Error('Enter a JSON object with a "rows" array.') }
  if (!value || typeof value !== 'object' || !Array.isArray(value.rows)) throw new Error('Provide a "rows" array.')
  if (value.rows.length > MAX_ROWS) throw new Error(`Use at most ${MAX_ROWS} rows in this visualizer.`)
  for (const row of value.rows) {
    if (!row || typeof row.date_id !== 'string' || row.date_id === '') throw new Error('Each row needs a non-empty date_id text.')
    if (typeof row.make_name !== 'string' || row.make_name === '') throw new Error('Each row needs a non-empty make_name text.')
    if (!Number.isInteger(row.lead_id) || !Number.isInteger(row.partner_id)) throw new Error('lead_id and partner_id must be integers.')
  }
  return value
}

function sortedReport(groups) {
  return [...groups.values()]
    .map(group => ({ date_id: group.date_id, make_name: group.make_name, unique_leads: group.leads.size, unique_partners: group.partners.size }))
    .sort((a, b) => (a.date_id < b.date_id ? -1 : a.date_id > b.date_id ? 1 : a.make_name < b.make_name ? -1 : a.make_name > b.make_name ? 1 : 0))
}

export function buildTrace({ rows }) {
  const groups = new Map()
  const snapshotOf = (rowIndex, extra = {}) => ({
    rowIndex,
    groups: [...groups.values()].map(group => ({ date_id: group.date_id, make_name: group.make_name, leads: [...group.leads], partners: [...group.partners] })),
    ...extra,
  })
  const frames = [{ phase: 'start', activeLine: 2, message: `Read ${rows.length} rows. No group exists yet.`, snapshot: snapshotOf(-1) }]
  rows.forEach((row, rowIndex) => {
    const key = JSON.stringify([row.date_id, row.make_name])
    const created = !groups.has(key)
    if (created) groups.set(key, { date_id: row.date_id, make_name: row.make_name, leads: new Set(), partners: new Set() })
    frames.push({ phase: 'group', activeLine: 4, message: created ? `New group (${row.date_id}, ${row.make_name}).` : `Existing group (${row.date_id}, ${row.make_name}).`, snapshot: snapshotOf(rowIndex) })
    const group = groups.get(key)
    group.leads.add(row.lead_id)
    frames.push({ phase: 'add', activeLine: 5, message: `Lead ${row.lead_id} is now counted in this group.`, snapshot: snapshotOf(rowIndex) })
    group.partners.add(row.partner_id)
    frames.push({ phase: 'add', activeLine: 6, message: `Partner ${row.partner_id} is now counted in this group.`, snapshot: snapshotOf(rowIndex) })
  })
  const result = sortedReport(groups)
  frames.push({ phase: 'done', activeLine: 7, message: `Report ${result.length} groups.`, snapshot: { ...snapshotOf(rows.length - 1), result } })
  return { input: { rows }, result, frames }
}

export const python = `def daily_leads_and_partners(rows):
    groups = {}
    for row in rows:
        key = (row["date_id"], row["make_name"])
        leads, partners = groups.setdefault(key, (set(), set()))
        leads.add(row["lead_id"])
        partners.add(row["partner_id"])
    return [
        {"date_id": d, "make_name": m, "unique_leads": len(l), "unique_partners": len(p)}
        for (d, m), (l, p) in sorted(groups.items())
    ]`

export const sql = `SELECT date_id, make_name,
       COUNT(DISTINCT lead_id) AS unique_leads,
       COUNT(DISTINCT partner_id) AS unique_partners
FROM events
GROUP BY date_id, make_name
ORDER BY date_id, make_name;`

export const code = [
  'FUNCTION dailyLeadsAndPartners(rows)',
  '    groups = empty map keyed by (date, make)',
  '    FOR EACH row IN rows',
  '        group = groups[(row.date, row.make)], created empty if new',
  '        ADD row.lead TO group.leads',
  '        ADD row.partner TO group.partners',
  '    RETURN each group sorted by date and make, with set sizes',
].map((text, index) => ({ line: index + 1, text }))

// Pseudocode activeLine -> Python line.
export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 5, 5: 6, 6: 7, 7: 8 }
