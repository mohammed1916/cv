// Knowledge-derived teaching model. Sample tables and wording are original.
const lineIn = (source, text) => {
  const index = source.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`No line contains: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'load', label: 'Invoices', description: 'Start from every invoice row.' },
  { id: 'trust', label: 'Trust check', description: 'Each contact is trusted when its email is a customer email.' },
  { id: 'group', label: 'Per user', description: 'Count contacts and trusted contacts for each user id.' },
  { id: 'join', label: 'Join', description: 'Attach the customer name and totals to each invoice.' },
  { id: 'order', label: 'Order', description: 'Sort by invoice id.' },
  { id: 'done', label: 'Result', description: 'Return the five requested columns.' },
]

export const sql = `
WITH contact_stats AS (
  SELECT user_id, COUNT(*) AS contacts_cnt,
    SUM(contact_email IN (SELECT email FROM Customers)) AS trusted_contacts_cnt
  FROM Contacts GROUP BY user_id)
SELECT i.invoice_id, c.customer_name, i.price,
  COALESCE(s.contacts_cnt, 0) AS contacts_cnt,
  COALESCE(s.trusted_contacts_cnt, 0) AS trusted_contacts_cnt
FROM Invoices i JOIN Customers c ON c.customer_id = i.user_id
LEFT JOIN contact_stats s ON s.user_id = i.user_id
ORDER BY i.invoice_id`.trim()

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `
def trusted_contacts(customers, contacts, invoices):
    emails = set(customers.email)
    contacts['trusted'] = contacts.contact_email.isin(emails)
    stats = contacts.groupby('user_id').agg(contacts_cnt=('contact_email', 'size'), trusted_contacts_cnt=('trusted', 'sum'))
    out = invoices.merge(customers, left_on='user_id', right_on='customer_id')
    out = out.merge(stats, left_on='user_id', right_index=True, how='left').fillna(0)
    return out[['invoice_id', 'customer_name', 'price', 'contacts_cnt', 'trusted_contacts_cnt']].sort_values('invoice_id')`.trim()

const S = text => lineIn(sql, text)
const P = text => lineIn(python, text)
const frame = (phase, sqlText, pyText, message, caption, rows) => ({
  phase, activeLine: S(sqlText), pythonLine: P(pyText), message, caption, rows: rows.map(row => ({ ...row })),
})

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object') throw new Error('Use an object with customers, contacts and invoices.')
  for (const key of ['customers', 'contacts', 'invoices']) {
    if (!Array.isArray(input[key])) throw new Error(`${key} must be a list.`)
  }
  const { customers, contacts, invoices } = input
  if (customers.length > 8 || contacts.length > 10 || invoices.length > 8) throw new Error('Keep it to 8 customers, 10 contacts and 8 invoices.')
  const ids = new Set()
  for (const row of customers) {
    if (!Number.isInteger(row.customer_id) || ids.has(row.customer_id)) throw new Error('customer_id must be a unique integer.')
    if (typeof row.customer_name !== 'string' || typeof row.email !== 'string' || !row.email.includes('@')) throw new Error('Each customer needs a name and an email.')
    ids.add(row.customer_id)
  }
  for (const row of contacts) {
    if (!ids.has(row.user_id)) throw new Error('Each contact user_id must be a customer_id.')
    if (typeof row.contact_name !== 'string' || typeof row.contact_email !== 'string') throw new Error('Each contact needs a name and an email.')
  }
  for (const row of invoices) {
    if (!Number.isInteger(row.invoice_id) || !ids.has(row.user_id) || !Number.isInteger(row.price) || row.price < 0) {
      throw new Error('Each invoice needs an integer id, a customer user_id and a price of 0 or more.')
    }
  }
  return input
}

export function buildTrace(input) {
  const { customers, contacts, invoices } = input
  const emails = new Set(customers.map(row => row.email))
  const names = new Map(customers.map(row => [row.customer_id, row.customer_name]))
  const frames = []
  frames.push(frame('load', 'FROM Invoices i', 'def trusted_contacts',
    `Start with ${invoices.length} invoices. Each one points at a customer id.`, 'Invoices', invoices))

  contacts.forEach((contact, index) => {
    const trusted = emails.has(contact.contact_email)
    const rows = contacts.map((row, position) => {
      let flag = '-'
      if (position <= index) flag = emails.has(row.contact_email) ? 'yes' : 'no'
      return { ...row, trusted: flag }
    })
    frames.push(frame('trust', 'IN (SELECT email', "contacts['trusted']",
      `${contact.contact_email} ${trusted ? 'belongs' : 'does not belong'} to a registered customer.`,
      'Contacts with trusted flag', rows))
  })

  const stats = new Map()
  for (const row of contacts) {
    const entry = stats.get(row.user_id) || { user_id: row.user_id, contacts_cnt: 0, trusted_contacts_cnt: 0 }
    entry.contacts_cnt += 1
    if (emails.has(row.contact_email)) entry.trusted_contacts_cnt += 1
    stats.set(row.user_id, entry)
  }
  const statRows = [...stats.values()].sort((a, b) => a.user_id - b.user_id)
  frames.push(frame('group', 'FROM Contacts GROUP BY', 'groupby',
    'Count contacts and trusted contacts per user. Customers without contacts do not appear here yet.', 'Per user totals', statRows))

  const joined = invoices.map(invoice => {
    const stat = stats.get(invoice.user_id) || { contacts_cnt: 0, trusted_contacts_cnt: 0 }
    return {
      invoice_id: invoice.invoice_id,
      customer_name: names.get(invoice.user_id),
      price: invoice.price,
      contacts_cnt: stat.contacts_cnt,
      trusted_contacts_cnt: stat.trusted_contacts_cnt,
    }
  })
  frames.push(frame('join', 'LEFT JOIN contact_stats', 'invoices.merge(customers',
    'Attach the customer name and totals. A customer with no contacts keeps 0 for both counts.', 'Joined invoices', joined))

  const result = [...joined].sort((a, b) => a.invoice_id - b.invoice_id)
  frames.push(frame('order', 'ORDER BY i.invoice_id', 'sort_values', 'Sort the rows by invoice id.', 'Sorted rows', result))
  frames.push(frame('done', 'SELECT i.invoice_id', 'return out',
    'The output has invoice_id, customer_name, price, contacts_cnt and trusted_contacts_cnt.', 'Result', result))
  return { input, result, frames }
}
