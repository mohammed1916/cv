import { TrackedMap, hashmapView } from '../../components/shared/hashmapModel.js'

const MAX_ROWS = 14

export const code = `keep only the first row for each email
  start with an empty map from email to first row
  for each row, read its email
    look the email up in the map
    if it is there, an earlier row owns it, so drop this row
    otherwise record this row as the first and keep it
  return the kept rows in their original order`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `import pandas as pd

def drop_duplicate_emails(customers):
    first_row_for = {}
    keep = []
    for position, email in enumerate(customers["email"]):
        if email in first_row_for:
            keep.append(False)
        else:
            first_row_for[email] = position
            keep.append(True)
    return customers[keep]
`

export const phases = [
  { id: 'start', label: 'Start', description: 'No email has been seen yet.' },
  { id: 'read', label: 'Read', description: 'Move to the next row and read its email.' },
  { id: 'lookup', label: 'Look up', description: 'Ask the map whether an earlier row used this email.' },
  { id: 'drop', label: 'Drop', description: 'An earlier row owns this email.' },
  { id: 'keep', label: 'Keep', description: 'This row is the first with this email.' },
  { id: 'done', label: 'Result', description: 'Return the kept rows.' },
]

const lineOf = (lines, fragment) => {
  const index = lines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`No line contains "${fragment}"`)
  return index + 1
}
const L = fragment => lineOf(code.map(c => c.text), fragment)
const PY = python.trim().split('\n')
const P = fragment => lineOf(PY, fragment)

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.customers)) throw new Error('Use an object with a customers array.')
  if (input.customers.length > MAX_ROWS) throw new Error(`Use at most ${MAX_ROWS} rows for the teaching view.`)
  for (const row of input.customers) {
    if (!row || !Number.isInteger(row.customer_id)) throw new Error('customer_id is an integer.')
    if (typeof row.name !== 'string') throw new Error('name is a string.')
    if (typeof row.email !== 'string' || row.email.length === 0) throw new Error('email is a non-empty string.')
  }
  return { customers: input.customers.map(({ customer_id, name, email }) => ({ customer_id, name, email })) }
}

export function buildTrace({ customers }) {
  const frames = []
  const seen = new TrackedMap('first_row_for', {
    keyLabel: 'email', valueLabel: 'first row',
    hit: 'an earlier row already owns this email, so this row is the duplicate',
    miss: 'no earlier row has this email, so this row is the one to keep',
  })
  const decisions = customers.map(() => null)
  const emit = (fields) => frames.push({ decisions: [...decisions], at: -1, firstRow: null, ...hashmapView(seen), ...fields })

  emit({ phase: 'start', activeLine: L('start with an empty map'), pythonLine: P('first_row_for = {}'), message: `${customers.length} row${customers.length === 1 ? '' : 's'} to check, and nothing remembered yet.` })
  customers.forEach((row, position) => {
    emit({ phase: 'read', activeLine: L('for each row'), pythonLine: P('for position, email'), at: position, message: `Row ${position} has email ${row.email}.` })
    if (seen.has(row.email)) {
      const firstRow = seen.get(row.email)
      emit({ phase: 'lookup', activeLine: L('look the email up'), pythonLine: P('if email in first_row_for'), at: position, firstRow, message: `${row.email} is already in the map: row ${firstRow} used it first.` })
      decisions[position] = 'drop'
      emit({ phase: 'drop', activeLine: L('so drop this row'), pythonLine: P('keep.append(False)'), at: position, firstRow, message: `Drop row ${position} (${row.name}). Row ${firstRow} stays, even though the names differ.` })
    } else {
      emit({ phase: 'lookup', activeLine: L('look the email up'), pythonLine: P('if email in first_row_for'), at: position, message: `${row.email} is not in the map, so no earlier row used it.` })
      seen.set(row.email, position)
      decisions[position] = 'keep'
      emit({ phase: 'keep', activeLine: L('record this row'), pythonLine: P('keep.append(True)'), at: position, message: `Keep row ${position} (${row.name}) and remember it as the first with ${row.email}.` })
    }
  })
  const result = customers.filter((_, position) => decisions[position] === 'keep').map(row => ({ ...row }))
  emit({ phase: 'done', activeLine: L('return the kept rows'), pythonLine: P('return customers[keep]'), message: `Return ${result.length} of ${customers.length} rows, still in their original order.` })
  return { input: { customers }, result, frames }
}
