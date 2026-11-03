// Knowledge-derived teaching model. The sample table is invented for this visualization.
// Teaching rule: display_name is the name followed by the first letter of the profession in parentheses, with no space.
// Rows are listed by person_id in descending order. Confirm the presentation details against the official statement.

export function lineOf(lines, text) {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing code line for: ${text}`)
  return index + 1
}

export const sql = `SELECT person_id,
       CONCAT(name, '(', LEFT(profession, 1), ')') AS display_name
FROM Person
ORDER BY person_id DESC`
const sqlLines = sql.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))

export const python = `import pandas as pd

def display_names(person):
    initial = person["profession"].str[0]
    out = pd.DataFrame({"person_id": person["person_id"], "display_name": person["name"] + "(" + initial + ")"})
    return out.sort_values("person_id", ascending=False).reset_index(drop=True)`
const pyLines = python.split('\n')
const sqlLn = text => lineOf(sqlLines, text)
const pyLn = text => lineOf(pyLines, text)

export const phases = [
  { id: 'load', label: 'Person', description: 'Read the person rows.' },
  { id: 'initial', label: 'Initial', description: 'Take the first letter of each profession.' },
  { id: 'concat', label: 'Concatenate', description: 'Join the name, the letter and the brackets.' },
  { id: 'order', label: 'Order', description: 'Sort by person_id, largest first.' },
  { id: 'done', label: 'Result', description: 'Output person_id and display_name.' },
]

const PERSON_COLS = ['person_id', 'name', 'profession']
const INITIAL_COLS = ['person_id', 'name', 'profession', 'initial']
const CONCAT_COLS = ['person_id', 'display_name']
const RESULT_COLS = ['person_id', 'display_name']

function frameAt(phase, sqlText, pyText, message, columns, rows) {
  return { phase, activeLine: sqlLn(sqlText), pythonLine: pyLn(pyText), message, columns, rows: rows.map(row => ({ ...row })) }
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || !Array.isArray(input.Person)) {
    throw new Error('Use a JSON object with a Person list.')
  }
  if (input.Person.length > 14) throw new Error('Person must have at most 14 rows.')
  const seen = new Set()
  input.Person.forEach((row, index) => {
    for (const column of PERSON_COLS) if (!(column in row)) throw new Error(`Person row ${index + 1} needs ${column}.`)
    if (!Number.isInteger(row.person_id) || seen.has(row.person_id)) throw new Error(`Person row ${index + 1} needs a unique whole person_id.`)
    seen.add(row.person_id)
    if (!/^[A-Za-z]+$/.test(row.name)) throw new Error(`Person row ${index + 1} name must be letters only.`)
    if (!/^[A-Za-z]+$/.test(row.profession)) throw new Error(`Person row ${index + 1} profession must be letters only.`)
  })
  return input
}

export function buildTrace(input) {
  const person = input.Person
  const frames = [frameAt('load', 'FROM Person', 'def display_names', `Load ${person.length} people.`, PERSON_COLS, person)]

  const withInitial = person.map(row => ({ person_id: row.person_id, name: row.name, profession: row.profession, initial: row.profession.charAt(0) }))
  frames.push(frameAt('initial', 'LEFT(profession, 1)', 'initial = person["profession"]', 'The first letter of each profession is taken.', INITIAL_COLS, withInitial))

  const concatenated = withInitial.map(row => ({ person_id: row.person_id, display_name: `${row.name}(${row.initial})` }))
  frames.push(frameAt('concat', "CONCAT(name, '('", 'out = pd.DataFrame', 'The name, an opening bracket, the letter and a closing bracket are joined.', CONCAT_COLS, concatenated))

  const result = [...concatenated].sort((a, b) => b.person_id - a.person_id)
  frames.push(frameAt('order', 'ORDER BY person_id DESC', 'return out.sort_values', 'Rows are listed by person_id, largest first.', RESULT_COLS, result))
  frames.push(frameAt('done', 'SELECT person_id', 'return out.sort_values', 'Output person_id and display_name for every person.', RESULT_COLS, result))
  return { input, result, frames }
}
