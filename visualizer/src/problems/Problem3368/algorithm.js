// Knowledge-derived teaching model (not the official statement): the whole text gets an uppercase first
// character and lowercase remaining characters. Word-by-word rules belong to the variant in problem 3374.

const SQL_LINES = [
  'SELECT content_id,',
  '       CONCAT(UPPER(LEFT(content_text, 1)), LOWER(SUBSTRING(content_text, 2))) AS content_text',
  'FROM Content',
  'ORDER BY content_id;',
]

const PY_LINES = [
  'def capitalize_first(content):',
  '    df = pd.DataFrame(content)',
  "    text = df['content_text'].str.lower()",
  "    df['content_text'] = text.str[:1].str.upper() + text.str[1:]",
  "    return df.sort_values('content_id')[['content_id', 'content_text']].to_dict('records')",
]

export const sql = SQL_LINES.join('\n')
export const code = SQL_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

export const phases = [
  { id: 'load', label: 'Load', description: 'Read every content row.' },
  { id: 'transform', label: 'Transform', description: 'Rebuild each text with a capital first letter.' },
  { id: 'order', label: 'Order', description: 'Sort by content_id.' },
  { id: 'output', label: 'Result', description: 'Show the normalized rows.' },
]

function lineOf(lines, fragment) {
  const index = lines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`No line contains "${fragment}"`)
  return index + 1
}
const sqlAt = fragment => lineOf(SQL_LINES, fragment)
const pyAt = fragment => lineOf(PY_LINES, fragment)

export function capitalizeFirst(text) {
  const lower = text.toLowerCase()
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.content)) throw new Error('Use an object with a content array.')
  if (input.content.length > 12) throw new Error('Use at most 12 rows for the teaching view.')
  const ids = new Set()
  for (const row of input.content) {
    if (!Number.isInteger(row.content_id) || ids.has(row.content_id)) throw new Error('Each content_id must be a unique integer.')
    ids.add(row.content_id)
    if (typeof row.content_text !== 'string' || row.content_text.length < 1 || row.content_text.length > 40 || !/^[A-Za-z0-9 ]+$/.test(row.content_text)) {
      throw new Error('content_text is 1 to 40 letters, digits or spaces.')
    }
  }
  return { content: input.content.map(row => ({ ...row })) }
}

export function buildTrace({ content }) {
  const frames = []
  const snap = rows => rows.map(row => ({ ...row }))
  frames.push({ phase: 'load', activeLine: sqlAt('FROM Content'), pythonLine: pyAt('DataFrame'), message: `Loaded ${content.length} rows.`, rows: snap(content) })

  const done = []
  for (const row of content) {
    done.push({ content_id: row.content_id, content_text: capitalizeFirst(row.content_text) })
    frames.push({ phase: 'transform', activeLine: sqlAt('CONCAT'), pythonLine: pyAt("df['content_text'] = text"), message: `"${row.content_text}" becomes "${done.at(-1).content_text}".`, rows: snap(done) })
  }

  const sorted = [...done].sort((a, b) => a.content_id - b.content_id)
  frames.push({ phase: 'order', activeLine: sqlAt('ORDER BY'), pythonLine: pyAt('sort_values'), message: 'Sort by content_id.', rows: snap(sorted) })
  frames.push({ phase: 'output', activeLine: sqlAt('SELECT content_id'), pythonLine: pyAt('return df'), message: `Result has ${sorted.length} rows.`, rows: snap(sorted), result: true })
  return { input: { content }, result: sorted, frames }
}
