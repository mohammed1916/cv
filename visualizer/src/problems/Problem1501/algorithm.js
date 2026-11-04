// Knowledge-derived teaching version. The sample tables are invented for this visualization.
const SQL = `WITH resident AS (
  SELECT p.id, c.name AS country
  FROM Person AS p
  JOIN Country AS c ON c.country_code = SUBSTRING_INDEX(p.phone_number, '-', 1)
),
sides AS (
  SELECT r.country, k.duration
  FROM Calls AS k JOIN resident AS r ON r.id = k.caller_id
  UNION ALL
  SELECT r.country, k.duration
  FROM Calls AS k JOIN resident AS r ON r.id = k.callee_id
),
per_country AS (
  SELECT country, AVG(duration) AS avg_duration
  FROM sides
  GROUP BY country
)
SELECT pc.country
FROM per_country AS pc
WHERE pc.avg_duration > (SELECT AVG(duration) FROM Calls)
ORDER BY pc.country`

const PANDAS = `import pandas as pd

def safe_countries(person, country, calls):
    person = person.assign(country_code=person["phone_number"].str.split("-").str[0])
    resident = person.merge(country.rename(columns={"name": "country"}), on="country_code")[["id", "country"]]
    sides = pd.concat([
        calls.merge(resident, left_on="caller_id", right_on="id")[["country", "duration"]],
        calls.merge(resident, left_on="callee_id", right_on="id")[["country", "duration"]],
    ])
    by_country = sides.groupby("country")["duration"].mean()
    overall = calls["duration"].mean()
    return by_country[by_country > overall].rename("avg_duration").reset_index()[["country"]].sort_values("country")`

const SQL_LINES = SQL.split('\n')
const PY_LINES = PANDAS.split('\n')

function lineOf(lines, text) {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing line: ${text}`)
  return index + 1
}

export const sql = SQL
export const python = PANDAS
export const code = SQL_LINES.map((text, index) => ({ line: index + 1, text }))

const frame = (phase, sqlText, pyText, message, columns, rows) => ({
  phase,
  activeLine: lineOf(SQL_LINES, sqlText),
  pythonLine: lineOf(PY_LINES, pyText),
  message,
  columns: [...columns],
  rows: rows.map(row => ({ ...row })),
})

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.Person) || !Array.isArray(input.Country) || !Array.isArray(input.Calls)) throw new Error('Use Person, Country and Calls lists.')
  if (input.Person.length > 12 || input.Country.length > 8 || input.Calls.length > 20) throw new Error('Use at most 12 people, 8 countries and 20 calls.')
  const Person = input.Person.map(row => {
    if (!row || !Number.isInteger(row.id) || typeof row.name !== 'string' || typeof row.phone_number !== 'string') throw new Error('Each person needs an id, name and phone_number.')
    return { id: row.id, name: row.name, phone_number: row.phone_number }
  })
  const Country = input.Country.map(row => {
    if (!row || typeof row.name !== 'string' || typeof row.country_code !== 'string') throw new Error('Each country needs a name and a country_code.')
    return { name: row.name, country_code: row.country_code }
  })
  const Calls = input.Calls.map(row => {
    if (!row || !Number.isInteger(row.caller_id) || !Number.isInteger(row.callee_id) || !Number.isInteger(row.duration) || row.duration < 0) {
      throw new Error('Each call needs integer caller_id, callee_id and a non-negative duration.')
    }
    return { caller_id: row.caller_id, callee_id: row.callee_id, duration: row.duration }
  })
  return { Person, Country, Calls }
}

export function buildTrace({ Person, Country, Calls }) {
  const codes = new Map(Country.map(row => [row.country_code, row.name]))
  const countryOf = new Map()
  const frames = []
  const residentRows = []
  for (const person of Person) {
    const prefix = person.phone_number.split('-')[0]
    const country = codes.get(prefix)
    if (country !== undefined) countryOf.set(person.id, country)
    residentRows.push({ id: person.id, name: person.name, country: country ?? 'not a resident' })
    frames.push(frame('resident', 'FROM Person AS p', 'person = person.assign',
      `${person.name} has prefix ${prefix}, so ${country ? `lives in ${country}` : 'is not counted'}.`,
      ['id', 'name', 'country'], residentRows))
    frames[frames.length - 1].focus = person.id
  }
  // Each call adds its duration once per resident participant, so a same-country call counts twice.
  const sides = []
  for (const call of Calls) {
    const parts = []
    for (const id of [call.caller_id, call.callee_id]) {
      if (countryOf.has(id)) {
        sides.push({ country: countryOf.get(id), duration: call.duration })
        parts.push(countryOf.get(id))
      }
    }
    frames.push(frame('participate', 'UNION ALL', 'sides = pd.concat',
      `Call ${call.caller_id} to ${call.callee_id} (${call.duration}s) counts for ${parts.length ? parts.join(' and ') : 'no country'}.`,
      ['country', 'duration'], sides))
    frames[frames.length - 1].focus = parts.length
  }
  const total = Calls.reduce((sum, call) => sum + call.duration, 0)
  const callCount = Calls.length
  const names = [...new Set(sides.map(row => row.country))].sort()
  const result = []
  const averages = []
  for (const name of names) {
    const mine = sides.filter(row => row.country === name)
    const sum = mine.reduce((acc, row) => acc + row.duration, 0)
    const count = mine.length
    // Compare sum/count with total/callCount using multiplication, so no rounding can change the answer.
    const beats = sum * callCount > total * count
    averages.push({ country: name, average: (sum / count).toFixed(2), beats_overall: beats ? 'yes' : 'no' })
    if (beats) result.push({ country: name })
    frames.push(frame('average', 'GROUP BY country', 'by_country = ',
      `${name} averages ${(sum / count).toFixed(2)} against an overall ${(total / callCount).toFixed(2)}.`,
      ['country', 'average', 'beats_overall'], averages))
    frames[frames.length - 1].focus = name
  }
  frames.push(frame('done', 'ORDER BY pc.country', 'return by_country', `Returned ${result.length} countries above the overall average.`, ['country'], result))
  return { input: { Person, Country, Calls }, result, frames }
}
